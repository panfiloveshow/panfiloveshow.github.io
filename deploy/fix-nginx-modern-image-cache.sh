#!/usr/bin/env bash
# Добавляет WebP/AVIF в годовой immutable-cache landing-ассетов Sellico.
# Запуск на сервере: sudo bash /home/crm_admin/fix-nginx-modern-image-cache-20260825.sh

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
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${NGINX_BACKUP_DIR:-/etc/nginx/seo-backups}"
BACKUP="${BACKUP_DIR}/$(basename "$CONFIG").before-modern-image-cache-${TIMESTAMP}"
WORK_FILE="$(mktemp)"

cleanup() {
  rm -f "$WORK_FILE"
}
trap cleanup EXIT

cp "$CONFIG" "$WORK_FILE"

python3 - "$WORK_FILE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

old = r"css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|js|mjs"
new = r"css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff2?|ttf|eot|js|mjs"

if new in text:
    print("WebP/AVIF уже включены в правило статики — конфигурация идемпотентна.")
elif text.count(old) == 1:
    text = text.replace(old, new, 1)
else:
    raise SystemExit(
        "Безопасная остановка: ожидаемое правило статики не найдено ровно один раз. "
        "Активная конфигурация отличается от проверенной версии."
    )

path.write_text(text)
PY

if [ -n "$RENDER_TO" ]; then
  install -m 0644 "$WORK_FILE" "$RENDER_TO"
  echo "Проверочная конфигурация сформирована: $RENDER_TO"
  exit 0
fi

mkdir -p "$BACKUP_DIR"
if ! nginx -t; then
  echo "Исходная nginx-конфигурация не проходит проверку; патч не применяется." >&2
  exit 1
fi

cp -a "$CONFIG" "$BACKUP"
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

echo "Кэш WebP/AVIF включён. Резервная копия: $BACKUP"
