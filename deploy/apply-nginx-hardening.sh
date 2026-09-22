#!/usr/bin/env bash
# Защитные заголовки (HSTS, nosniff, X-Frame-Options, Referrer-Policy) на всех ответах sellico.ru,
# склейка дублей /раздел/index.html → /раздел/, gzip_vary и charset для HTML.
# Запуск на сервере: sudo bash /home/crm_admin/apply-nginx-hardening.sh
#
# Почему сниппет в каждом location, а не четыре add_header на уровне server: nginx наследует
# add_header из server только в location без собственных add_header. Почти у каждого location
# есть свой add_header Cache-Control — и на HTML лендинга защитные заголовки молча пропадали.
#
# Повторный запуск безопасен: конфиг уже пропатчен — обновится только сниппет. Так HSTS включается
# после продления сертификата: пока сертификату осталось меньше 30 дней, HSTS не ставим — с ним
# браузер не пустит на сайт с просроченным сертификатом даже через «всё равно перейти».
#
# Локальная проверка преобразования без root:
#   NGINX_CONFIG=./default NGINX_PATCH_RENDER_TO=./default.patched SNIPPET_PATH=./snippet.conf HSTS=on \
#     bash ./apply-nginx-hardening.sh

set -euo pipefail

RENDER_TO="${NGINX_PATCH_RENDER_TO:-}"
if [ -z "$RENDER_TO" ] && [ "${EUID}" -ne 0 ]; then
  echo "Ошибка: скрипт должен быть запущен через sudo/root." >&2
  exit 1
fi

REQUESTED_CONFIG="${NGINX_CONFIG:-/etc/nginx/sites-enabled/default}"
if [ ! -e "$REQUESTED_CONFIG" ]; then
  echo "Ошибка: nginx-конфигурация не найдена: $REQUESTED_CONFIG" >&2
  exit 1
fi

CONFIG="$(readlink -f "$REQUESTED_CONFIG")"
SNIPPET="${SNIPPET_PATH:-/etc/nginx/snippets/sellico-security-headers.conf}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
# Бэкапы не кладём в sites-enabled: nginx подхватил бы их как второй server.
BACKUP_DIR="${NGINX_BACKUP_DIR:-/etc/nginx/seo-backups}"
BACKUP="${BACKUP_DIR}/$(basename "$CONFIG").before-hardening-${TIMESTAMP}"
WORK_FILE="$(mktemp)"
SNIPPET_WORK="$(mktemp)"
trap 'rm -f "$WORK_FILE" "$SNIPPET_WORK"' EXIT

HSTS="${HSTS:-auto}"
if [ "$HSTS" = "auto" ]; then
  if echo | openssl s_client -connect 127.0.0.1:443 -servername sellico.ru 2>/dev/null \
    | openssl x509 -noout -checkend $((30 * 24 * 3600)) >/dev/null 2>&1; then
    HSTS=on
  else
    HSTS=off
    echo "ВНИМАНИЕ: сертификату sellico.ru осталось меньше 30 дней (или он не читается) — HSTS не включаю." >&2
    echo "Продлите сертификат и запустите скрипт ещё раз." >&2
  fi
fi

{
  echo "# Управляется apply-nginx-hardening.sh ($TIMESTAMP). Подключается на уровне server"
  echo "# и в каждом location со своим add_header — иначе nginx не наследует эти заголовки."
  if [ "$HSTS" = "on" ]; then
    echo 'add_header Strict-Transport-Security "max-age=31536000" always;'
  fi
  echo 'add_header X-Content-Type-Options "nosniff" always;'
  echo 'add_header X-XSS-Protection "1; mode=block" always;'
  echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;'
  echo '# X-Frame-Options намеренно не здесь: CRM-маршруты (/booking, /roadmap/public) могут'
  echo '# встраиваться во фреймы. DENY стоит только в HTML-location лендинга и там, где был раньше.'
} > "$SNIPPET_WORK"

cp "$CONFIG" "$WORK_FILE"

python3 - "$WORK_FILE" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()
INCLUDE = 'include snippets/sellico-security-headers.conf;'

if INCLUDE in text:
    print('Конфигурация уже пропатчена — обновляю только сниппет.')
    sys.exit(0)

# Эти заголовки теперь приходят из сниппета. X-Frame-Options остаётся там, где был.
SECURITY = re.compile(
    r'^\s*add_header\s+(X-Content-Type-Options|X-XSS-Protection|Referrer-Policy|Strict-Transport-Security)\s'
)
FRAME_DENY = 'add_header X-Frame-Options "DENY" always;'
# HTML лендинга: страницы, главная и 404. Им DENY нужен явно — свои add_header Cache-Control
# отрезают его наследование с уровня server.
LANDING_HTML = {'location = / {', 'location / {', 'location = /unit-economics/ {',
                'location = /seo-cards/ {', 'location = /404.html {'}
MAIN_TAIL = r'''
	# apply-nginx-hardening.sh: кодировка HTML, Vary для gzip и склейка дублей /раздел/index.html.
	charset utf-8;
	charset_types text/html text/xml text/plain text/vnd.wap.wml application/javascript application/rss+xml text/markdown;
	gzip_vary on;
	# $request_uri — адрес из запроса клиента: внутренний переход index → /раздел/index.html сюда не попадает.
	# CRM не трогаем: её service worker может запрашивать /crm/index.html напрямую.
	if ($request_uri ~ "^(?!/crm/|//)([^?]*/)index\.html(\?.*)?$") { return 301 $1$2; }'''


def braces(line):
    """Фигурные скобки вне кавычек и комментариев."""
    opens = closes = 0
    quote = None
    for ch in line:
        if quote:
            if ch == quote:
                quote = None
        elif ch in '"\'':
            quote = ch
        elif ch == '#':
            break
        elif ch == '{':
            opens += 1
        elif ch == '}':
            closes += 1
    return opens, closes


def indent(line):
    return re.match(r'\s*', line).group(0)


out = []
stack = []
patched_locations = 0
main_server_done = www_server_done = False

for line in text.split('\n'):
    stripped = line.strip()
    opens, closes = braces(line)
    top = stack[-1] if stack else None

    if top and top['kind'] == 'server' and stripped.startswith('server_name '):
        top['name'] = stripped[len('server_name '):].rstrip(';').strip()

    if opens > closes:
        stack.append({'kind': stripped.split()[0], 'name': None, 'start': len(out), 'opener': stripped,
                      'indent': indent(line), 'add_header': False, 'frame': False, 'replaced': False})
        out.append(line)
        continue

    if closes > opens:
        block = stack.pop()
        if block['kind'] == 'location' and block['add_header']:
            added = [block['indent'] + '\t' + INCLUDE]
            if block['opener'] in LANDING_HTML and not block['frame']:
                added.append(block['indent'] + '\t' + FRAME_DENY)
            out[block['start'] + 1:block['start'] + 1] = added
            patched_locations += 1
        elif block['kind'] == 'server' and block['name'] == 'sellico.ru':
            if not block['replaced']:
                raise SystemExit('Безопасная остановка: в server sellico.ru не найдены add_header уровня server.')
            out.extend(MAIN_TAIL.split('\n')[1:])
            main_server_done = True
        elif block['kind'] == 'server' and block['name'] == 'www.sellico.ru':
            out.insert(block['start'] + 1, block['indent'] + '\t' + INCLUDE)
            www_server_done = True
        out.append(line)
        continue

    if top and stripped.startswith('add_header'):
        if top['kind'] == 'location':
            top['add_header'] = True
            top['frame'] = top['frame'] or 'X-Frame-Options' in line
        if SECURITY.match(line):
            if top['kind'] == 'server' and top['name'] == 'sellico.ru' and not top['replaced']:
                out.append(indent(line) + INCLUDE)
                top['replaced'] = True
            continue  # заголовки безопасности теперь приходят из сниппета

    if top and top['kind'] == 'location' and opens and opens == closes and 'add_header' in line:
        raise SystemExit(f'Безопасная остановка: однострочный вложенный блок с add_header: {stripped}')

    out.append(line)

if stack:
    raise SystemExit('Безопасная остановка: несбалансированные фигурные скобки в конфигурации.')
if not (main_server_done and www_server_done):
    raise SystemExit('Безопасная остановка: не найдены server sellico.ru и/или www.sellico.ru.')

text = '\n'.join(out)
gzip_old = 'application/xml+rss image/svg+xml;'
if text.count(gzip_old) == 1:
    text = text.replace(gzip_old, 'application/xml+rss image/svg+xml image/x-icon text/markdown;')

path.write_text(text)
print(f'Сниппет подключён в {patched_locations} location и в оба HTTPS server.')
PY

if [ -n "$RENDER_TO" ]; then
  install -m 0644 "$WORK_FILE" "$RENDER_TO"
  install -m 0644 "$SNIPPET_WORK" "$SNIPPET"
  echo "Проверочная конфигурация: $RENDER_TO, сниппет: $SNIPPET"
  exit 0
fi

mkdir -p "$BACKUP_DIR" "$(dirname "$SNIPPET")"
cp -a "$CONFIG" "$BACKUP"
SNIPPET_EXISTED=0
if [ -e "$SNIPPET" ]; then
  SNIPPET_EXISTED=1
  cp -a "$SNIPPET" "${BACKUP}.snippet"
fi

rollback() {
  echo "$1 — возвращаю исходную конфигурацию." >&2
  cp -a "$BACKUP" "$CONFIG"
  if [ "$SNIPPET_EXISTED" = 1 ]; then cp -a "${BACKUP}.snippet" "$SNIPPET"; else rm -f "$SNIPPET"; fi
  nginx -t && systemctl reload nginx
  exit 1
}

install -m 0644 "$SNIPPET_WORK" "$SNIPPET"
install -m 0644 "$WORK_FILE" "$CONFIG"

nginx -t || rollback "nginx -t завершился с ошибкой"
systemctl reload nginx || rollback "Reload nginx завершился с ошибкой"

echo "Готово (HSTS: $HSTS). Резервная копия: $BACKUP"
echo "Проверка:"
echo "  curl -sI https://sellico.ru/ | grep -iE 'strict-transport|nosniff|x-frame|referrer|content-type'"
echo "  curl -sI https://sellico.ru/wildberries/index.html | grep -iE '^HTTP|^location'"
