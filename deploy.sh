#!/bin/bash
# Sellico landing — production deploy.
# Pattern matches /Users/panfiloveshow/Documents/front 2/frontend/deploy-prod-dist.sh
#   1. Local pnpm build
#   2. Backup remote dist to archive
#   3. rsync local dist over remote target
#
# Override env vars to retarget (subdomain not finalised yet):
#   DEPLOY_REMOTE         user@host (default crm_admin@sellico.ru)
#   DEPLOY_DIST_PATH      remote dist target (default /var/www/html/landing/dist)
#   DEPLOY_BACKUP_DIR     remote backup directory (default /home/crm_admin/archive)
#   DEPLOY_SSH_OPTS       extra ssh options
#   DEPLOY_BUILD_CMD      build command (default 'pnpm build')
# Optional sshpass: export SSHPASS=... and install sshpass.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REMOTE="${DEPLOY_REMOTE:-crm_admin@sellico.ru}"
REMOTE_DIST_PATH="${DEPLOY_DIST_PATH:-/var/www/html/landing/dist}"
REMOTE_BACKUP_DIR="${DEPLOY_BACKUP_DIR:-/home/crm_admin/archive}"
SSH_OPTS="${DEPLOY_SSH_OPTS:--o StrictHostKeyChecking=no}"
BUILD_CMD="${DEPLOY_BUILD_CMD:-pnpm build}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh не найден"
  exit 1
fi
if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync не найден"
  exit 1
fi

cd "$ROOT_DIR"

echo "==> Building landing"
eval "$BUILD_CMD"

if [ ! -d "$ROOT_DIR/dist" ]; then
  echo "Папка dist не найдена после сборки"
  exit 1
fi

SSH_BASE=(ssh)
RSYNC_BASE=(rsync)

if command -v sshpass >/dev/null 2>&1 && [ -n "${SSHPASS:-}" ]; then
  SSH_BASE=(sshpass -e ssh)
  RSYNC_BASE=(sshpass -e rsync)
fi

echo "==> Backing up remote dist to $REMOTE_BACKUP_DIR/landing-dist-$TIMESTAMP"
"${SSH_BASE[@]}" $SSH_OPTS "$REMOTE" \
  "mkdir -p '$REMOTE_BACKUP_DIR' && if [ -d '$REMOTE_DIST_PATH' ]; then cp -a '$REMOTE_DIST_PATH' '$REMOTE_BACKUP_DIR/landing-dist-$TIMESTAMP'; fi"

echo "==> Deploying dist to $REMOTE:$REMOTE_DIST_PATH"
"${RSYNC_BASE[@]}" -az --delete -e "ssh $SSH_OPTS" "$ROOT_DIR/dist/" "$REMOTE:$REMOTE_DIST_PATH/"

echo "==> Deployment completed"
