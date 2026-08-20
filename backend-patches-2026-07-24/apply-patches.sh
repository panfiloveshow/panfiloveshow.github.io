#!/usr/bin/env bash
# Применение патчей бэкенда Sellico от 2026-07-24 (Альфа TLS + удаление документов)
set -e
B=/var/www/html/backend
A=/home/crm_admin/archive/legal-docs-2026-07-24
P=/tmp/patches

mkdir -p "$A"
cp "$B/app/Services/Payments/Alfa/AlfaPaymentService.php" "$A/AlfaPaymentService.orig.php"
cp "$B/config/services.php" "$A/services.orig.php"
cp "$B/app/Http/Controllers/Api/WorkspaceLegalDocumentController.php" "$A/WorkspaceLegalDocumentController.v1.php"
cp "$B/routes/api.php" "$A/routes-api.orig.php"

php -l "$P/AlfaPaymentService.php"
php -l "$P/services.php"
php -l "$P/WorkspaceLegalDocumentController.php"
php -l "$P/routes-api.php"

cp "$P/AlfaPaymentService.php" "$B/app/Services/Payments/Alfa/AlfaPaymentService.php"
cp "$P/services.php" "$B/config/services.php"
cp "$P/WorkspaceLegalDocumentController.php" "$B/app/Http/Controllers/Api/WorkspaceLegalDocumentController.php"
cp "$P/routes-api.php" "$B/routes/api.php"

grep -q '^ALFA_PAYMENT_CA_BUNDLE=' "$B/.env" || echo 'ALFA_PAYMENT_CA_BUNDLE=/var/www/html/backend/resources/certs/ca-bundle-with-russian.pem' >> "$B/.env"

cd "$B"
php artisan config:cache
php artisan route:cache
echo "=== ALL PATCHES APPLIED OK ==="
