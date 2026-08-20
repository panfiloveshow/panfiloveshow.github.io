#!/usr/bin/env bash
# Патч №3 от 2026-07-24: счёт — новый дизайн (Chrome), цена из workspace, подпись, фикс SIGTRAP.
# Исправленный генератор загружен в /tmp/patches3/. Скрипт ставит его на место + правит .env + кеш.
set -e
B=/var/www/html/backend
A=/home/crm_admin/archive/legal-docs-2026-07-24
P=/tmp/patches3

mkdir -p "$A"
cp "$B/.env" "$A/env-pre-patch3"
cp "$B/app/Services/Legal/WorkspaceInvoicePdfGenerator.php" "$A/WorkspaceInvoicePdfGenerator.pre-patch3.php" 2>/dev/null || true

# 1) Генератор счёта: Chrome-рендер + HOME для www-data (иначе SIGTRAP/signal 5)
php -l "$P/WorkspaceInvoicePdfGenerator.php"
cp "$P/WorkspaceInvoicePdfGenerator.php" "$B/app/Services/Legal/WorkspaceInvoicePdfGenerator.php"

# 2) Цена счёта = индивидуальная стоимость workspace (как оплата картой), а не прайс-лист
if grep -q '^BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE=' "$B/.env"; then
  sed -i 's/^BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE=.*/BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE=true/' "$B/.env"
else
  echo 'BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE=true' >> "$B/.env"
fi

# 3) Явный путь к Chrome (в коде есть хардкод-фолбэк, это для надёжности)
grep -q '^LEGAL_PDF_CHROME_BINARY=' "$B/.env" || echo 'LEGAL_PDF_CHROME_BINARY=/usr/bin/google-chrome' >> "$B/.env"

echo "--- .env now: ---"
grep -E '^BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE|^LEGAL_PDF_CHROME_BINARY' "$B/.env"

cd "$B"
php artisan config:cache
echo "=== PATCH 3 APPLIED OK ==="
