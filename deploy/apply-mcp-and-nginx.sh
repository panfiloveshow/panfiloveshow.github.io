#!/usr/bin/env bash
# Run with sudo from /home/crm_admin/sellico-mcp-rollout after reviewing candidate.conf:
#   sudo bash /home/crm_admin/sellico-mcp-rollout/apply-mcp-and-nginx.sh
set -euo pipefail

if [ "$(id -u)" != "0" ]; then
  echo "Run this script with sudo: sudo bash $0" >&2
  exit 1
fi

STAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG=/etc/nginx/sites-enabled/default
SNIPPET=/etc/nginx/snippets/sellico-agent-discovery.conf
SEC_SNIPPET=/etc/nginx/snippets/sellico-security-headers.conf
UNIT=/etc/systemd/system/sellico-mcp.service

for FILE in original.conf candidate.conf nginx-agent-discovery.conf sellico-mcp.service; do
  test -r "$STAGE_DIR/$FILE"
done

if ! cmp -s "$CONFIG" "$STAGE_DIR/original.conf" && ! cmp -s "$CONFIG" "$STAGE_DIR/candidate.conf"; then
  echo "Nginx configuration changed since staging. Regenerate candidate.conf before applying." >&2
  exit 1
fi

BACKUP_DIR="$(mktemp -d /var/backups/sellico-mcp-rollout.XXXXXXXX)"
cp -a "$CONFIG" "$BACKUP_DIR/site.conf"
if [ -e "$SNIPPET" ]; then
  cp -a "$SNIPPET" "$BACKUP_DIR/snippet.conf"
fi
if [ -e "$SEC_SNIPPET" ]; then
  cp -a "$SEC_SNIPPET" "$BACKUP_DIR/sec-snippet.conf"
fi
if [ -e "$UNIT" ]; then
  cp -a "$UNIT" "$BACKUP_DIR/sellico-mcp.service"
fi

restore_all() {
  local status=$?
  trap - ERR
  cp -a "$BACKUP_DIR/site.conf" "$CONFIG"
  if [ -e "$BACKUP_DIR/snippet.conf" ]; then
    cp -a "$BACKUP_DIR/snippet.conf" "$SNIPPET"
  fi
  if [ -e "$BACKUP_DIR/sec-snippet.conf" ]; then
    cp -a "$BACKUP_DIR/sec-snippet.conf" "$SEC_SNIPPET"
  fi
  if [ -e "$BACKUP_DIR/sellico-mcp.service" ]; then
    cp -a "$BACKUP_DIR/sellico-mcp.service" "$UNIT"
    systemctl daemon-reload || true
    systemctl restart sellico-mcp.service || true
  else
    systemctl stop sellico-mcp.service 2>/dev/null || true
    systemctl disable sellico-mcp.service 2>/dev/null || true
    rm -f "$UNIT"
    systemctl daemon-reload || true
  fi
  if nginx -t; then
    systemctl reload nginx || true
  fi
  echo "Rollout failed; previous state restored from $BACKUP_DIR" >&2
  exit "$status"
}
trap restore_all ERR

install -m 0644 -o root -g root "$STAGE_DIR/sellico-mcp.service" "$UNIT"
systemctl daemon-reload
systemctl enable sellico-mcp.service
systemctl restart sellico-mcp.service

# Wait up to 5 seconds for 127.0.0.1:4180/healthz, OAuth discovery, and A2A Agent Card
HEALTH_OK=0
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:4180/healthz >/dev/null 2>&1 && \
     curl -fsS http://127.0.0.1:4180/.well-known/oauth-authorization-server >/dev/null 2>&1 && \
     curl -fsS http://127.0.0.1:4180/.well-known/oauth-protected-resource >/dev/null 2>&1 && \
     curl -fsS http://127.0.0.1:4180/.well-known/agent-card.json >/dev/null 2>&1; then
    HEALTH_OK=1
    break
  fi
  sleep 0.5
done
if [ "$HEALTH_OK" != "1" ]; then
  systemctl status sellico-mcp.service --no-pager >&2 || true
  echo "sellico-mcp.service did not pass /healthz + OAuth + A2A checks" >&2
  false
fi

if [ -e "$SEC_SNIPPET" ]; then
  SEC_TMP="$(mktemp)"
  {
    echo "# Managed by sellico-mcp-rollout ($(date +%Y%m%d-%H%M%S))."
    if echo | openssl s_client -connect 127.0.0.1:443 -servername sellico.ru 2>/dev/null \
      | openssl x509 -noout -checkend $((14 * 24 * 3600)) >/dev/null 2>&1; then
      echo 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;'
    fi
    echo 'add_header X-Content-Type-Options "nosniff" always;'
    echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;'
    echo 'add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;'
    echo 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;'
  } > "$SEC_TMP"
  install -m 0644 -o root -g root "$SEC_TMP" "$SEC_SNIPPET"
  rm -f "$SEC_TMP"
fi

install -m 0644 -o root -g root "$STAGE_DIR/nginx-agent-discovery.conf" "$SNIPPET"
install -m 0644 -o root -g root "$STAGE_DIR/candidate.conf" "$CONFIG"
nginx -t
systemctl reload nginx

trap - ERR
echo "MCP + A2A service, security headers, and Nginx agent discovery installed successfully. Backup: $BACKUP_DIR"
