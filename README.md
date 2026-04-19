# SoloClaw

A personal AI that runs on your computer. One command to install, zero configuration.

Based on [OpenClaw](https://github.com/openclaw/openclaw).

## Install

**Requirements:** macOS with 12GB free RAM and [Ollama](https://ollama.com) installed.

```bash
git clone https://github.com/soloclaw/soloclaw.git
cd soloclaw
pnpm install && pnpm build
pnpm openclaw onboard
```

That's it. SoloClaw installs a free local AI model (gemma3:12b via Ollama), starts the gateway service, and opens the chat UI. No API keys, no accounts, no questions asked.

## Quick Start

```bash
# Talk to your AI in the terminal
openclaw tui

# Send a one-off message
openclaw agent --message "Hello"

# Check gateway status
openclaw gateway status --deep
```

## Extend It

SoloClaw starts minimal. Tell your AI what you need and it sets itself up:

- *"Connect to my Telegram"* — adds messaging channels
- *"Search the web for me"* — adds web search
- *"Use a smarter model"* — switches to a more capable AI

No menus, no config files. Just ask.

## What's Included

- **Local AI model** — gemma3:12b, free, runs entirely on your machine
- **Gateway service** — always-on background service (LaunchAgent on macOS)
- **Chat UI** — browser-based TUI to talk to your AI
- **Multi-channel inbox** — extensible to WhatsApp, Telegram, Slack, Discord, and [25+ channels](https://docs.openclaw.ai/channels)
- **Tools** — browser, cron, sessions, and more via [skills](https://docs.openclaw.ai/tools/skills)
- **Companion apps** — optional macOS, [iOS](https://docs.openclaw.ai/platforms/ios), and [Android](https://docs.openclaw.ai/platforms/android) apps

## Using a Different Model

Override the default model during install:

```bash
pnpm openclaw onboard --custom-model-id qwen2.5:14b
```

Or switch later:

```bash
openclaw config set agent.model ollama/qwen2.5:14b
```

Any model available in [Ollama](https://ollama.com/library) works. You can also use cloud providers (OpenAI, Anthropic, etc.) by running the full interactive setup:

```bash
pnpm openclaw onboard --non-interactive --accept-risk --auth-choice openai --openai-api-key YOUR_KEY
```

## Configuration

Config lives at `~/.openclaw/openclaw.json`:

```json5
{
  agent: {
    model: "ollama/gemma3:12b",
  },
}
```

[Full configuration reference.](https://docs.openclaw.ai/gateway/configuration)

## Security

- Default: tools run on the host with full access (single-user mode).
- For multi-user/channel safety: enable [Docker sandboxing](https://docs.openclaw.ai/install/docker).
- DM pairing is on by default — unknown senders must be approved before the bot responds.
- Full guide: [Security](https://docs.openclaw.ai/gateway/security)

## From Source (Development)

Prefer `pnpm` for builds from source. Bun is optional for running TypeScript directly.

```bash
git clone https://github.com/soloclaw/soloclaw.git
cd soloclaw

pnpm install
pnpm ui:build   # auto-installs UI deps on first run
pnpm build

pnpm openclaw onboard

# Dev loop (auto-reload on source/config changes)
pnpm gateway:watch
```

Note: `pnpm openclaw ...` runs TypeScript directly (via `tsx`). `pnpm build` produces `dist/` for running via Node / the packaged `openclaw` binary.

## Docs

- [Getting started](https://docs.openclaw.ai/start/getting-started)
- [Channels](https://docs.openclaw.ai/channels)
- [Tools & Skills](https://docs.openclaw.ai/tools)
- [Configuration](https://docs.openclaw.ai/gateway/configuration)
- [Architecture](https://docs.openclaw.ai/concepts/architecture)
- [FAQ](https://docs.openclaw.ai/help/faq)

## License

MIT
