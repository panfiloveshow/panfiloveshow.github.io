#!/usr/bin/env bash
# Run with sudo from the staged rollout directory after reviewing candidate.conf.
# That directory must contain original.conf, candidate.conf and the companion snippet.
set -euo pipefail

if [ "$(id -u)" != "0" ]; then
  echo 'Run this script with sudo.' >&2
  exit 1
fi

STAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG=/etc/nginx/sites-enabled/default
SNIPPET=/etc/nginx/snippets/sellico-agent-discovery.conf

for FILE in original.conf candidate.conf nginx-agent-discovery.conf; do
  test -r "$STAGE_DIR/$FILE"
done

if cmp -s "$CONFIG" "$STAGE_DIR/candidate.conf" && cmp -s "$SNIPPET" "$STAGE_DIR/nginx-agent-discovery.conf"; then
  nginx -t
  echo 'Agent discovery nginx configuration is already installed.'
  exit 0
fi

if ! cmp -s "$CONFIG" "$STAGE_DIR/original.conf"; then
  echo 'Nginx configuration changed after preparation. Regenerate and review the candidate before installing.' >&2
  exit 1
fi

BACKUP_DIR="$(mktemp -d /var/backups/sellico-agent-discovery.XXXXXXXX)"
cp -a "$CONFIG" "$BACKUP_DIR/site.conf"
if [ -e "$SNIPPET" ]; then
  cp -a "$SNIPPET" "$BACKUP_DIR/snippet.conf"
fi

restore_config() {
  local status=$?
  trap - ERR
  cp -a "$BACKUP_DIR/site.conf" "$CONFIG"
  if [ -e "$BACKUP_DIR/snippet.conf" ]; then
    cp -a "$BACKUP_DIR/snippet.conf" "$SNIPPET"
  else
    rm -f "$SNIPPET"
  fi
  echo "Nginx install failed; original files restored from $BACKUP_DIR" >&2
  if nginx -t; then
    systemctl reload nginx || true
  fi
  exit "$status"
}
trap restore_config ERR

install -m 0644 -o root -g root "$STAGE_DIR/nginx-agent-discovery.conf" "$SNIPPET"
install -m 0644 -o root -g root "$STAGE_DIR/candidate.conf" "$CONFIG"
nginx -t
systemctl reload nginx
trap - ERR
echo "Agent discovery nginx configuration installed. Backup: $BACKUP_DIR"
