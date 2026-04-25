#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: run-codex-task.sh --prompt-file PATH [options]

Options:
  --prompt-file PATH   File containing the Codex task prompt. Required.
  --cd DIR             Working directory for codex exec. Defaults to the current directory.
  --model MODEL        Optional model override.
  --sandbox MODE       Sandbox mode for codex exec. Defaults to workspace-write.
  --approval POLICY    Approval policy. Defaults to never.
  --output PATH        File for the final Codex response. Defaults to a temp file.
  --json               Emit Codex JSONL events to stdout.
  --no-ephemeral       Persist the Codex session instead of using --ephemeral.
  -h, --help           Show this help text.
EOF
}

prompt_file=""
workdir="$(pwd)"
model=""
sandbox="workspace-write"
approval="never"
output_file=""
json_mode=0
ephemeral=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt-file)
      prompt_file="${2:-}"
      shift 2
      ;;
    --cd)
      workdir="${2:-}"
      shift 2
      ;;
    --model)
      model="${2:-}"
      shift 2
      ;;
    --sandbox)
      sandbox="${2:-}"
      shift 2
      ;;
    --approval)
      approval="${2:-}"
      shift 2
      ;;
    --output)
      output_file="${2:-}"
      shift 2
      ;;
    --json)
      json_mode=1
      shift
      ;;
    --no-ephemeral)
      ephemeral=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$prompt_file" ]]; then
  echo "--prompt-file is required" >&2
  usage >&2
  exit 2
fi

if [[ ! -f "$prompt_file" ]]; then
  echo "Prompt file not found: $prompt_file" >&2
  exit 1
fi

if [[ ! -d "$workdir" ]]; then
  echo "Working directory not found: $workdir" >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI is not installed or not on PATH" >&2
  exit 1
fi

cleanup_output=0
if [[ -z "$output_file" ]]; then
  output_file="$(mktemp "${TMPDIR:-/tmp}/codex-last-message.XXXXXX.txt")"
  cleanup_output=1
fi

cmd=(
  codex exec
  --cd "$workdir"
  --sandbox "$sandbox"
  --ask-for-approval "$approval"
  --output-last-message "$output_file"
)

if [[ -n "$model" ]]; then
  cmd+=(--model "$model")
fi

if [[ "$json_mode" -eq 1 ]]; then
  cmd+=(--json)
fi

if [[ "$ephemeral" -eq 1 ]]; then
  cmd+=(--ephemeral)
fi

cmd+=(-)

echo "Running: ${cmd[*]}"
echo "Prompt file: $prompt_file"
echo "Last message file: $output_file"

"${cmd[@]}" <"$prompt_file"

echo
echo "Final response:"
cat "$output_file"

if [[ "$cleanup_output" -eq 1 ]]; then
  echo
  echo "Note: output file was auto-created at $output_file"
fi
