#!/usr/bin/env bash
set -euo pipefail

cd /repo

export SOLOCLAW_STATE_DIR="/tmp/openclaw-test"
export SOLOCLAW_CONFIG_PATH="${SOLOCLAW_STATE_DIR}/soloclaw.json"

echo "==> Build"
if ! pnpm build >/tmp/openclaw-cleanup-build.log 2>&1; then
  cat /tmp/openclaw-cleanup-build.log
  exit 1
fi

echo "==> Seed state"
mkdir -p "${SOLOCLAW_STATE_DIR}/credentials"
mkdir -p "${SOLOCLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${SOLOCLAW_CONFIG_PATH}"
echo 'creds' >"${SOLOCLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${SOLOCLAW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
if ! pnpm soloclaw reset --scope config+creds+sessions --yes --non-interactive >/tmp/openclaw-cleanup-reset.log 2>&1; then
  cat /tmp/openclaw-cleanup-reset.log
  exit 1
fi

test ! -f "${SOLOCLAW_CONFIG_PATH}"
test ! -d "${SOLOCLAW_STATE_DIR}/credentials"
test ! -d "${SOLOCLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${SOLOCLAW_STATE_DIR}/credentials"
echo '{}' >"${SOLOCLAW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
if ! pnpm soloclaw uninstall --state --yes --non-interactive >/tmp/openclaw-cleanup-uninstall.log 2>&1; then
  cat /tmp/openclaw-cleanup-uninstall.log
  exit 1
fi

test ! -d "${SOLOCLAW_STATE_DIR}"

echo "OK"
