#!/usr/bin/env bash
# Патч №2 от 2026-07-24: failUrl для отменённых оплат (payment=fail)
set -e
B=/var/www/html/backend
A=/home/crm_admin/archive/legal-docs-2026-07-24
P=/tmp/patches2

cp "$B/app/Services/Payments/Alfa/AlfaPaymentService.php" "$A/AlfaPaymentService.v2-pre.php"
php -l "$P/AlfaPaymentService.php"
cp "$P/AlfaPaymentService.php" "$B/app/Services/Payments/Alfa/AlfaPaymentService.php"

sed -i "s|^ALFA_PAYMENT_FAIL_URL=.*|ALFA_PAYMENT_FAIL_URL=https://sellico.ru/crm/feed?payment=fail|" "$B/.env"
grep "^ALFA_PAYMENT_FAIL_URL" "$B/.env"

cd "$B"
php artisan config:cache
echo "=== PATCH 2 APPLIED OK ==="
