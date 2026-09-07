#!/usr/bin/env bash
# Точечный production-патч nginx для SEO Sellico.
# Запуск на сервере: sudo bash /home/crm_admin/apply-nginx-seo-20260825.sh

set -euo pipefail

# Для локальной проверки преобразования без root:
# NGINX_CONFIG=/tmp/default NGINX_PATCH_RENDER_TO=/tmp/default.patched bash ./apply-nginx-seo.sh
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
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${NGINX_BACKUP_DIR:-/etc/nginx/seo-backups}"
BACKUP="${BACKUP_DIR}/$(basename "$CONFIG").before-seo-${TIMESTAMP}"
WORK_FILE="$(mktemp)"

cleanup() {
  rm -f "$WORK_FILE"
}
trap cleanup EXIT

if [ -z "$RENDER_TO" ]; then
  mkdir -p "$BACKUP_DIR"

  # nginx.conf обычно включает все файлы из sites-enabled. Ранние версии скрипта
  # ошибочно оставляли backup рядом с active config, что создавало duplicate server.
  # Переносим такие файлы до первой проверки, не удаляя их.
  shopt -s nullglob
  for stray_backup in "${CONFIG}.before-seo-"*; do
    mv "$stray_backup" "$BACKUP_DIR/"
  done
  shopt -u nullglob

  if ! nginx -t; then
    echo "Исходная nginx-конфигурация не проходит проверку; патч не применяется." >&2
    exit 1
  fi

  cp -a "$CONFIG" "$BACKUP"
fi
cp "$CONFIG" "$WORK_FILE"

python3 - "$WORK_FILE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()


def replace_once(label: str, old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Безопасная остановка: блок «{label}» найден {count} раз вместо одного. "
            "Активная конфигурация отличается от проверенной версии."
        )
    text = text.replace(old, new, 1)


replace_once(
    "HTTPS redirect для www",
    '''server {
\tlisten 443;
\tlisten [::]:443;
\tserver_name "~^www\\.(.*)$";
\treturn 301 https://sellico.ru$request_uri;
}''',
    '''server {
\tlisten 443 ssl http2;
\tlisten [::]:443 ssl http2;
\tserver_name www.sellico.ru;

\tssl_certificate     /etc/ssl/sellico.crt;
\tssl_certificate_key /etc/ssl/sellico.key;
\tssl_protocols TLSv1.2 TLSv1.3;

\treturn 301 https://sellico.ru$request_uri;
}''',
)

replace_once(
    "канонический host основного HTTPS-сервера",
    "\tserver_name sellico.ru www.sellico.ru;",
    "\tserver_name sellico.ru;",
)

replace_once(
    "раздача landing",
    '''\t# Landing SPA.
\tlocation / {
\t\ttry_files $uri $uri/ /index.html;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t\tadd_header Pragma "no-cache" always;
\t\tadd_header Expires "0" always;
\t}''',
    '''\t# Landing: канонические HTML-URL и машиночитаемые файлы.
\tlocation = / {
\t\ttry_files /index.html =404;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t\tadd_header Pragma "no-cache" always;
\t\tadd_header Expires "0" always;
\t}
\tlocation = /index.html { return 301 /; }

\t# Эти SEO-страницы пересекаются с историческими префиксами CRM выше.
\t# Exact locations гарантируют, что публичные URL всегда отдают landing.
\tlocation = /unit-economics { return 301 /unit-economics/; }
\tlocation = /unit-economics/index.html { return 301 /unit-economics/; }
\tlocation = /unit-economics/ {
\t\ttry_files /unit-economics/index.html =404;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t}
\tlocation = /seo-cards { return 301 /seo-cards/; }
\tlocation = /seo-cards/index.html { return 301 /seo-cards/; }
\tlocation = /seo-cards/ {
\t\ttry_files /seo-cards/index.html =404;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t}

\tlocation = /pricing.md {
\t\tdefault_type text/markdown;
\t\tcharset utf-8;
\t\tadd_header Link '<https://sellico.ru/pricing/>; rel="canonical"' always;
\t\tadd_header X-Robots-Tag 'noindex, follow' always;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t\ttry_files $uri =404;
\t}
\tlocation = /llms.txt {
\t\tdefault_type text/plain;
\t\tcharset utf-8;
\t\ttry_files $uri =404;
\t}
\tlocation = /llms-full.txt {
\t\tdefault_type text/plain;
\t\tcharset utf-8;
\t\ttry_files $uri =404;
\t}
\tlocation = /indexnow-key.txt {
\t\tdefault_type text/plain;
\t\tcharset utf-8;
\t\tadd_header X-Robots-Tag 'noindex' always;
\t\ttry_files $uri =404;
\t}
\tlocation = /robots.txt {
\t\tdefault_type text/plain;
\t\tcharset utf-8;
\t\texpires 1h;
\t\ttry_files $uri =404;
\t}
\tlocation = /sitemap.xml {
\t\tdefault_type application/xml;
\t\texpires 1h;
\t\ttry_files $uri =404;
\t}

\t# Без SPA-fallback: неизвестный URL должен возвращать настоящий 404.
\tlocation / {
\t\ttry_files $uri $uri/ =404;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t\tadd_header Pragma "no-cache" always;
\t\tadd_header Expires "0" always;
\t}

\terror_page 404 /404.html;
\tlocation = /404.html {
\t\tinternal;
\t\ttry_files /404.html =404;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t}''',
)

replace_once(
    "HTTP redirect для обоих host",
    '''server {
\tlisten 80;
\tlisten [::]:80;
\tserver_name sellico.ru;
\treturn 301 https://sellico.ru$request_uri;
}''',
    '''server {
\tlisten 80;
\tlisten [::]:80;
\tserver_name sellico.ru www.sellico.ru;
\treturn 301 https://sellico.ru$request_uri;
}''',
)

# Современные изображения marketplace-страниц раньше проваливались в общий
# no-cache location /, потому что regex статики перечислял только png/jpg/svg.
static_types_old = r"css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|js|mjs"
static_types_new = r"css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff2?|ttf|eot|js|mjs"
if static_types_old in text:
    text = text.replace(static_types_old, static_types_new, 1)

path.write_text(text)
PY

if [ -n "$RENDER_TO" ]; then
  install -m 0644 "$WORK_FILE" "$RENDER_TO"
  echo "Проверочная конфигурация сформирована: $RENDER_TO"
  exit 0
fi

install -m 0644 "$WORK_FILE" "$CONFIG"

if ! nginx -t; then
  echo "nginx -t завершился с ошибкой — возвращаю исходную конфигурацию." >&2
  cp -a "$BACKUP" "$CONFIG"
  nginx -t
  exit 1
fi

if ! systemctl reload nginx; then
  echo "Reload nginx завершился с ошибкой — возвращаю исходную конфигурацию." >&2
  cp -a "$BACKUP" "$CONFIG"
  nginx -t
  systemctl reload nginx
  exit 1
fi

ANALYZER="/home/crm_admin/analyze-ai-traffic.sh"
if [ -x "$ANALYZER" ] && [ -r /var/log/nginx/sellico_access.log ]; then
  REPORT="/home/crm_admin/seo-ai-traffic-${TIMESTAMP}.txt"
  "$ANALYZER" /var/log/nginx/sellico_access.log > "$REPORT"
  chown crm_admin:crm_admin "$REPORT"
  echo "Отчёт по AI-трафику: $REPORT"
fi

echo "SEO-патч nginx применён. Резервная копия: $BACKUP"
