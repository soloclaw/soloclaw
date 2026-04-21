# SoloClaw

<p align="center">
    <img src="docs/assets/soloclaw-logo.png" alt="SoloClaw" width="500">
</p>

A personal AI that runs on your computer. One command to install, zero configuration.

Based on [OpenClaw](https://github.com/openclaw/openclaw).

## Why SoloClaw

- **Zero friction** — one command to install, no configuration, no maintenance. It just works.
- **Completely free** — runs entirely on your machine with open-source models. No API keys, no subscriptions, no cloud dependency.
- **Self-extending** — need a new capability? Just ask. SoloClaw installs skills on demand from natural language requests.
- **Continuously learning** — remembers your preferences, learns from conversations, and gets better over time through workspace memory.

## Install

**Requirements:** macOS with [Ollama](https://ollama.com) installed.

```bash
git clone https://github.com/soloclaw/soloclaw.git
cd soloclaw
pnpm install && pnpm build
pnpm openclaw onboard
```

That's it. SoloClaw installs a free local AI model via Ollama, configures web search, starts the gateway service, and opens the chat UI. No API keys, no accounts, no questions asked.

### Dependencies

Install these before running SoloClaw:

| Dependency | Purpose | Install |
|-----------|---------|---------|
| [Node.js 22+](https://nodejs.org) | Runtime | `brew install node` |
| [pnpm](https://pnpm.io) | Package manager | `npm install -g pnpm` |
| [Ollama](https://ollama.com) | Local AI models | Download from [ollama.com](https://ollama.com) |
| [Docker](https://docker.com) | SearXNG web search | Download from [docker.com](https://docker.com) |

Start SearXNG before onboarding:

```bash
docker run -d -p 8080:8080 searxng/searxng
```

### Choose Your Model Size

| Flag | Model | RAM Required |
|------|-------|-------------|
| `--small` | gemma4:e2b | 8GB |
| `--medium` (default) | qwen3.5:9b | 19GB |
| `--large` | gemma4:26b | 24GB |

```bash
pnpm openclaw onboard --small    # Low-end machines
pnpm openclaw onboard            # Defaults to medium
pnpm openclaw onboard --large    # High-end machines
```

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

**LLM**
- qwen3.5:9b (medium), free local model via Ollama

**Skills/Tools**
- Web search — SearXNG (self-hosted, Docker)
- Browser — agent-controlled Chromium for reading web pages
- bash — run shell commands
- read / write / edit — file operations
- Extensible — add more via workspace skills

**Channels**
- Telegram, Discord built-in

**Interface**
- Browser-based TUI

**Infrastructure**
- Always-on LaunchAgent gateway (macOS)

## Using a Different Model

Use a preset size:

```bash
pnpm openclaw onboard --small     # gemma4:e2b
pnpm openclaw onboard --medium    # qwen3.5:9b
pnpm openclaw onboard --large     # gemma4:26b
```

Or specify any Ollama model directly:

```bash
pnpm openclaw onboard --custom-model-id qwen2.5:14b
```

Switch model after install:

```bash
openclaw config set agents.defaults.model.primary ollama/gemma4:e2b
```

Any model available in [Ollama](https://ollama.com/library) works. You can also use cloud providers (OpenAI, Anthropic, etc.):

```bash
pnpm openclaw onboard --non-interactive --accept-risk --auth-choice openai --openai-api-key YOUR_KEY
```

## Configuration

Config lives at `~/.openclaw/openclaw.json`:

```json5
{
  agent: {
    model: "ollama/qwen3.5:9b",
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

## License

MIT
