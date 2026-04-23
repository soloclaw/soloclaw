#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${SOLOCLAW_INSTALL_E2E_IMAGE:-openclaw-install-e2e:local}"
INSTALL_URL="${SOLOCLAW_INSTALL_URL:-https://openclaw.bot/install.sh}"

OPENAI_API_KEY="${OPENAI_API_KEY:-}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
ANTHROPIC_API_TOKEN="${ANTHROPIC_API_TOKEN:-}"
SOLOCLAW_E2E_MODELS="${SOLOCLAW_E2E_MODELS:-}"

echo "==> Build image: $IMAGE_NAME"
docker build \
  -t "$IMAGE_NAME" \
  -f "$ROOT_DIR/scripts/docker/install-sh-e2e/Dockerfile" \
  "$ROOT_DIR/scripts/docker"

echo "==> Run E2E installer test"
docker run --rm \
  -e SOLOCLAW_INSTALL_URL="$INSTALL_URL" \
  -e SOLOCLAW_INSTALL_TAG="${SOLOCLAW_INSTALL_TAG:-latest}" \
  -e SOLOCLAW_E2E_MODELS="$SOLOCLAW_E2E_MODELS" \
  -e SOLOCLAW_INSTALL_E2E_PREVIOUS="${SOLOCLAW_INSTALL_E2E_PREVIOUS:-}" \
  -e SOLOCLAW_INSTALL_E2E_SKIP_PREVIOUS="${SOLOCLAW_INSTALL_E2E_SKIP_PREVIOUS:-0}" \
  -e SOLOCLAW_NO_ONBOARD=1 \
  -e OPENAI_API_KEY \
  -e ANTHROPIC_API_KEY \
  -e ANTHROPIC_API_TOKEN \
  "$IMAGE_NAME"
