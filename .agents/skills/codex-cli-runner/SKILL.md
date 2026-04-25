---
name: codex-cli-runner
description: Run a separate Codex CLI task non-interactively with `codex exec`. Use when Codex needs to hand off a bounded task to an isolated Codex run, target a different working directory, capture the final response to a file, or keep the current session focused while another Codex invocation does the work.
---

# Codex CLI Runner

Use this skill when a separate `codex exec` run is the right tool.

## Prefer this skill when

- the user explicitly wants work run through the Codex CLI
- the task should run in a different directory or with a different model
- you want a clean captured result file from a bounded subtask
- multiline instructions would be awkward or error-prone to quote inline

## Default workflow

1. Put the task instructions in a prompt file. Prefer a file over inline shell quoting for anything non-trivial.
2. Run `scripts/run-codex-task.sh` from this skill directory.
3. Read the saved final response file and summarize or integrate the result.

## Command wrapper

The wrapper defaults to:

- `codex exec`
- `--sandbox workspace-write`
- `--ask-for-approval never`
- `--ephemeral`
- `--output-last-message <file>`

It reads the prompt from a file through stdin by passing `-` to `codex exec`, which avoids quoting bugs for multiline prompts.

## Usage

```bash
.agents/skills/codex-cli-runner/scripts/run-codex-task.sh \
  --prompt-file /tmp/codex-task.md
```

Run in another directory:

```bash
.agents/skills/codex-cli-runner/scripts/run-codex-task.sh \
  --cd extensions/discord \
  --prompt-file /tmp/codex-task.md
```

Choose a model and output file:

```bash
.agents/skills/codex-cli-runner/scripts/run-codex-task.sh \
  --model gpt-5.4 \
  --output /tmp/codex-last-message.txt \
  --prompt-file /tmp/codex-task.md
```

## Notes

- Keep prompts bounded and explicit. This is best for well-scoped work, not open-ended exploration.
- The wrapper prints the exact command it runs, the last-message path, and the final response.
- If you need raw event output, pass `--json`.
