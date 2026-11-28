#!/usr/bin/env bash
# Atomic Nginx SEO/Security rollout for sellico.ru.
# Usage on server:
#   sudo bash /home/crm_admin/sellico-seo-rollout/apply.sh
# Optional: enable Brotli (installs libnginx-mod-http-brotli-filter if missing):
#   sudo ENABLE_BROTLI=1 bash /home/crm_admin/sellico-seo-rollout/apply.sh
set -euo pipefail

if [ "$(id -u)" != "0" ]; then
  echo "Run this script with sudo: sudo bash $0" >&2
  exit 1
fi

STAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG=/etc/nginx/sites-enabled/default
AGENT_SNIPPET=/etc/nginx/snippets/sellico-agent-discovery.conf
SEC_SNIPPET=/etc/nginx/snippets/sellico-security-headers.conf
BROTLI_CONF=/etc/nginx/conf.d/sellico-brotli.conf

for FILE in original.conf candidate.conf nginx-agent-discovery.conf sellico-security-headers.conf; do
  test -r "$STAGE_DIR/$FILE"
done

if ! cmp -s "$CONFIG" "$STAGE_DIR/original.conf" && ! cmp -s "$CONFIG" "$STAGE_DIR/candidate.conf"; then
  echo "Nginx configuration changed since staging. Regenerate candidate.conf before applying." >&2
  exit 1
fi

BACKUP_DIR="$(mktemp -d /var/backups/sellico-seo-rollout.XXXXXXXX)"
cp -a "$CONFIG" "$BACKUP_DIR/site.conf"
[ -e "$AGENT_SNIPPET" ] && cp -a "$AGENT_SNIPPET" "$BACKUP_DIR/agent-snippet.conf"
[ -e "$SEC_SNIPPET" ] && cp -a "$SEC_SNIPPET" "$BACKUP_DIR/sec-snippet.conf"
[ -e "$BROTLI_CONF" ] && cp -a "$BROTLI_CONF" "$BACKUP_DIR/brotli.conf"

restore_all() {
  local status=$?
  trap - ERR
  cp -a "$BACKUP_DIR/site.conf" "$CONFIG"
  [ -e "$BACKUP_DIR/agent-snippet.conf" ] && cp -a "$BACKUP_DIR/agent-snippet.conf" "$AGENT_SNIPPET"
  [ -e "$BACKUP_DIR/sec-snippet.conf" ] && cp -a "$BACKUP_DIR/sec-snippet.conf" "$SEC_SNIPPET"
  if [ -e "$BACKUP_DIR/brotli.conf" ]; then
    cp -a "$BACKUP_DIR/brotli.conf" "$BROTLI_CONF"
  else
    rm -f "$BROTLI_CONF"
  fi
  if nginx -t; then
    systemctl reload nginx || true
  fi
  echo "Rollout failed; previous Nginx state restored from $BACKUP_DIR" >&2
  exit "$status"
}
trap restore_all ERR

if [ "${ENABLE_BROTLI:-0}" = "1" ]; then
  if ! dpkg -s libnginx-mod-http-brotli-filter >/dev/null 2>&1; then
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libnginx-mod-http-brotli-filter; then
      echo "Direct apt-get install failed; refreshing package index (--allow-releaseinfo-change) and retrying..." >&2
      DEBIAN_FRONTEND=noninteractive apt-get update --allow-releaseinfo-change -qq || true
      DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libnginx-mod-http-brotli-filter || true
    fi
  fi
  if dpkg -s libnginx-mod-http-brotli-filter >/dev/null 2>&1 && compgen -G "/etc/nginx/modules-enabled/*brotli*" >/dev/null; then
    cat > "$BROTLI_CONF" <<'EOF'
brotli on;
brotli_comp_level 5;
brotli_min_length 1024;
brotli_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss image/svg+xml image/x-icon text/markdown;
EOF
    chmod 0644 "$BROTLI_CONF"
  else
    echo "Warning: libnginx-mod-http-brotli-filter unavailable; skipping Brotli config and continuing Nginx security/404 rollout." >&2
  fi
fi

install -m 0644 -o root -g root "$STAGE_DIR/sellico-security-headers.conf" "$SEC_SNIPPET"
install -m 0644 -o root -g root "$STAGE_DIR/nginx-agent-discovery.conf" "$AGENT_SNIPPET"
install -m 0644 -o root -g root "$STAGE_DIR/candidate.conf" "$CONFIG"

nginx -t
systemctl reload nginx

trap - ERR
echo "Nginx SEO/Security rollout installed successfully. Backup: $BACKUP_DIR"
