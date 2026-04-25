---
name: codex
description: "Run Codex CLI for bounded coding, review, or repo analysis tasks from SoloClaw. Usage: /codex <task>"
user-invocable: true
disable-model-invocation: true
metadata:
  {
    "soloclaw":
      {
        "emoji": "🤖",
        "requires": { "bins": ["codex"] },
        "install":
          [
            {
              "id": "node-codex",
              "kind": "node",
              "package": "@openai/codex",
              "bins": ["codex"],
              "label": "Install Codex CLI (npm)",
            },
          ],
      },
  }
---

# Codex CLI

Use this skill when the user explicitly wants a task run through the Codex CLI from SoloClaw, usually via `/codex ...`.

## Goal

Run a bounded `codex exec` task and return the result back to the chat.

## Default path

Use the `bash` tool with:

- `pty:true`
- `workdir:` set to the most relevant project directory
- `command:` using `codex exec`

For short tasks, run in the foreground:

```bash
bash pty:true workdir:/path/to/project command:"codex exec --full-auto 'Your task here'"
```

For longer tasks, use background mode and then monitor with `process`:

```bash
bash pty:true workdir:/path/to/project background:true command:"codex exec --full-auto 'Your task here'"
```

Then use:

- `process action:log`
- `process action:poll`
- `process action:submit` when Codex asks for input

## Rules

- Keep the Codex prompt narrow and explicit.
- Prefer the current workspace or the repo path the user named.
- If the current directory is not a git repo and the task is scratch work, create a temp repo with `git init` before running `codex exec`.
- Use `codex review` instead of `codex exec` when the user explicitly wants a code review.
- Summarize the final Codex result back to the user instead of pasting noisy terminal logs.

## Safety

- Prefer `codex exec --full-auto` over unsafe no-sandbox modes unless the user explicitly asks otherwise.
- Do not use dangerous flags that bypass approvals or sandboxing unless the user explicitly requests that tradeoff.
- If Codex needs follow-up input, send only the minimum needed response.
