---
name: codex
description: "Run Codex CLI for bounded coding, review, or repo analysis tasks from SoloClaw. Usage: /codex <task>"
homepage: https://github.com/openai/codex
user-invocable: true
disable-model-invocation: true
metadata:
  {
    "soloclaw":
      {
        "emoji": "🤖",
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

## Prerequisites

- The `codex` CLI must be installed on the host. If missing, install with `npm install -g @openai/codex`.

## PR review workflow

Codex runs sandboxed and cannot access the network. When the user asks to review a PR, pre-fetch everything locally before invoking Codex:

1. Clone or navigate to the repo locally.
2. Fetch the PR diff and description with `gh`:
   ```bash
   gh pr diff <number> > /tmp/pr-<number>.diff
   gh pr view <number> --json title,body,files > /tmp/pr-<number>.json
   ```
3. Run Codex in the repo directory, pointing it at the local files:
   ```bash
   bash pty:true workdir:/path/to/repo command:"codex exec --full-auto 'Review this PR. The diff is at /tmp/pr-<number>.diff and metadata at /tmp/pr-<number>.json. Provide a thorough code review.'"
   ```

## Rules

- Keep the Codex prompt narrow and explicit.
- Prefer the current workspace or the repo path the user named.
- If the current directory is not a git repo and the task is scratch work, create a temp repo with `git init` before running `codex exec`.
- Use `codex review` instead of `codex exec` when the user explicitly wants a code review of the current branch (not a specific PR).
- Summarize the final Codex result back to the user instead of pasting noisy terminal logs.

## Safety

- Prefer `codex exec --full-auto` over unsafe no-sandbox modes unless the user explicitly asks otherwise.
- Do not use dangerous flags that bypass approvals or sandboxing unless the user explicitly requests that tradeoff.
- If Codex needs follow-up input, send only the minimum needed response.
