#!/usr/bin/env bash
# Устраняет цикл / -> /index.html -> / в уже применённом SEO-конфиге.

set -euo pipefail

if [ "${EUID}" -ne 0 ]; then
  echo "Ошибка: скрипт должен быть запущен через sudo/root." >&2
  exit 1
fi

REQUESTED_CONFIG="${NGINX_CONFIG:-/etc/nginx/sites-enabled/default}"
CONFIG="$(readlink -f "$REQUESTED_CONFIG")"
BACKUP_DIR="${NGINX_BACKUP_DIR:-/etc/nginx/seo-backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="${BACKUP_DIR}/$(basename "$CONFIG").before-root-loop-fix-${TIMESTAMP}"
WORK_FILE="$(mktemp)"

cleanup() {
  rm -f "$WORK_FILE"
}
trap cleanup EXIT

mkdir -p "$BACKUP_DIR"

if ! nginx -t; then
  echo "Исходная nginx-конфигурация не проходит проверку; исправление не применяется." >&2
  exit 1
fi

cp -a "$CONFIG" "$BACKUP"
cp "$CONFIG" "$WORK_FILE"

python3 - "$WORK_FILE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
marker = "\tlocation = /index.html { return 301 /; }"
replacement = '''\tlocation = / {
\t\ttry_files /index.html =404;
\t\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;
\t\tadd_header Pragma "no-cache" always;
\t\tadd_header Expires "0" always;
\t}
\tlocation = /index.html { return 301 /; }'''

if text.count(marker) != 1:
    raise SystemExit("Безопасная остановка: ожидаемый index.html-блок не найден ровно один раз")
if "\tlocation = / {\n\t\ttry_files /index.html =404;" in text:
    raise SystemExit("Исправление уже присутствует")

path.write_text(text.replace(marker, replacement, 1))
PY

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

echo "Цикл главной страницы устранён. Резервная копия: $BACKUP"
