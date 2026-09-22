#!/usr/bin/env bash
# Переводит sellico.ru и www.sellico.ru с годового AlphaSSL (истекает 2026-10-05, сам не продлевается)
# на Let's Encrypt с автопродлением через certbot.timer.
# Запуск на сервере: sudo bash /home/crm_admin/switch-to-letsencrypt.sh
#
# Проверка домена — webroot в каталоге лендинга: HTTP-запрос уходит редиректом на HTTPS, а там
# /.well-known/ не закрыт (правило deny пропускает well-known). Nginx во время выпуска не трогаем.

set -euo pipefail

[ "${EUID}" -eq 0 ] || { echo "Ошибка: запустите через sudo." >&2; exit 1; }
command -v certbot >/dev/null || { echo "Ошибка: certbot не установлен (apt install certbot)." >&2; exit 1; }

CONFIG="$(readlink -f /etc/nginx/sites-enabled/default)"
WEBROOT=/var/www/html/landing/dist
LIVE=/etc/letsencrypt/live/sellico.ru
# Бэкап не в sites-enabled: nginx подхватил бы его как второй server.
BACKUP="/etc/nginx/seo-backups/$(basename "$CONFIG").before-letsencrypt-$(date +%Y%m%d-%H%M%S)"

# Если аккаунта Let's Encrypt на сервере ещё нет, certbot сам спросит email и согласие с условиями.
certbot certonly --webroot -w "$WEBROOT" -d sellico.ru -d www.sellico.ru \
  --cert-name sellico.ru --keep-until-expiring --deploy-hook "systemctl reload nginx"

mkdir -p "$(dirname "$BACKUP")"
cp -a "$CONFIG" "$BACKUP"
sed -i "s#/etc/ssl/sellico.crt#$LIVE/fullchain.pem#g; s#/etc/ssl/sellico.key#$LIVE/privkey.pem#g" "$CONFIG"

if ! nginx -t; then
  echo "nginx -t завершился с ошибкой — возвращаю прежний сертификат." >&2
  cp -a "$BACKUP" "$CONFIG"
  exit 1
fi
systemctl reload nginx

echo "Готово. Сертификат: $LIVE, резервная копия конфига: $BACKUP"
echo "Автопродление: systemctl list-timers certbot.timer; пробный прогон: certbot renew --dry-run"
