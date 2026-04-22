# SoloClaw

<p align="center">
    <img src="docs/assets/soloclaw-logo.png" alt="SoloClaw" width="500">
</p>

A personal AI that runs on your computer. One command to install, zero configuration.

Based on [OpenClaw](https://github.com/openclaw/openclaw).

## Why SoloClaw

- **Zero friction** — one command to install, no configuration, no maintenance. It just works.
- **Completely free** — runs entirely on your machine with well-tested open-source models. No API keys, no subscriptions, no cloud dependency.
- **Self-extending** — need a new capability? Just ask. SoloClaw installs skills on demand from natural language requests.
- **Continuously learning** — remembers your preferences, learns from conversations, and gets better over time through workspace memory.

## Install

**Requirements:** macOS with [Ollama](https://ollama.com) installed.

```bash
git clone https://github.com/soloclaw/soloclaw.git
cd soloclaw
pnpm install && pnpm build
pnpm soloclaw onboard
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
pnpm soloclaw onboard --small    # Low-end machines
pnpm soloclaw onboard            # Defaults to medium
pnpm soloclaw onboard --large    # High-end machines
```

## Quick Start

```bash
# Talk to your AI in the terminal
soloclaw tui

# Send a one-off message
soloclaw agent --message "Hello"

# Check gateway status
soloclaw gateway status --deep
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

**Plugins** (`extensions/`) — system-level components integrated with the gateway. Always running, configured in config.
- Web search — SearXNG (self-hosted, Docker)
- Browser — agent-controlled Chromium for reading web pages
- Channels — Telegram, Discord built-in
- Model provider — Ollama (local, free)

**Tools** (`src/agents/`) — built-in APIs the model can call directly. Always available, no installation needed.
- bash — run shell commands
- read / write / edit — file operations
- web_search — search the web via the configured plugin
- browser — open and read web pages

**Skills** (`skills/`) — lightweight instruction files that teach the model how to use CLI tools for specific tasks. Installed on demand to `~/.soloclaw/workspace/skills/`.
- 35 bundled templates (weather, github, spotify, apple-notes, etc.)
- Install by asking: *"install the weather skill"*
- Create your own: the `skill-creator` skill lets the AI build new skills

**CLIs** — external command-line tools that skills depend on. Installed via Homebrew or npm when needed.
- Skills will tell you which CLIs to install (e.g., `brew install gh` for GitHub, `brew install himalaya` for email)
- Not bundled with SoloClaw — managed by your system package manager

**Interface**
- Browser-based TUI

**Infrastructure**
- Always-on LaunchAgent gateway (macOS)

## How It Works

```
User
  │
  ├── CLI (soloclaw tui / soloclaw agent)
  │     │
  │     ▼
  │   Gateway (always-on background service)
  │     │
  │     ├── Plugins (loaded at startup)
  │     │     ├── ollama → sends prompts to local LLM
  │     │     ├── browser → manages Chromium
  │     │     ├── searxng → web search backend
  │     │     ├── telegram → polls for messages
  │     │     └── discord → connects via WebSocket
  │     │
  │     ├── Tools (registered as callable functions)
  │     │     ├── bash, read, write, edit (core)
  │     │     ├── web_search → calls searxng plugin
  │     │     ├── browser → calls browser plugin
  │     │     └── cron, sessions, discord actions
  │     │
  │     └── Agent Runtime
  │           ├── Reads AGENTS.md, SOUL.md, skill files
  │           ├── Sends prompt + tool definitions to LLM
  │           ├── LLM responds with text or tool calls
  │           ├── Gateway executes tool calls via plugins
  │           └── Loop until done
  │
  └── Channels (alternative entry points)
        ├── Telegram message → Gateway → Agent → Telegram
        └── Discord message → Gateway → Agent → Discord
```

**Message flow:**

1. You type in the TUI (or send a Telegram/Discord message)
2. **Gateway** receives the message and creates a session
3. **Agent Runtime** builds a prompt from workspace files (AGENTS.md, SOUL.md) and skill instructions
4. **Ollama plugin** sends the prompt to the local LLM
5. LLM responds — either with text or a tool call (e.g., `web_search("liverpool score")`)
6. **Gateway** routes the tool call to the right plugin (SearXNG)
7. **Plugin** executes the work and returns results
8. Results go back to the LLM for another turn
9. LLM produces a final text response
10. **Gateway** sends it back to you

**Key insight:** Plugins provide the infrastructure, tools provide the API surface, skills provide the knowledge, and the LLM orchestrates everything.

## Using a Different Model

Use a preset size:

```bash
pnpm soloclaw onboard --small     # gemma4:e2b
pnpm soloclaw onboard --medium    # qwen3.5:9b
pnpm soloclaw onboard --large     # gemma4:26b
```

Or specify any Ollama model directly:

```bash
pnpm soloclaw onboard --custom-model-id qwen2.5:14b
```

Switch model after install:

```bash
soloclaw config set agents.defaults.model.primary ollama/gemma4:e2b
```

Any model available in [Ollama](https://ollama.com/library) works. You can also use cloud providers (OpenAI, Anthropic, etc.):

```bash
pnpm soloclaw onboard --non-interactive --accept-risk --auth-choice openai --openai-api-key YOUR_KEY
```

## Configuration

Config lives at `~/.soloclaw/soloclaw.json`:

```json5
{
  agent: {
    model: "ollama/qwen3.5:9b",
  },
}
```

[Full configuration reference.](https://docs.soloclaw.ai/gateway/configuration)

## Security

- Default: tools run on the host with full access (single-user mode).
- For multi-user/channel safety: enable [Docker sandboxing](https://docs.soloclaw.ai/install/docker).
- DM pairing is on by default — unknown senders must be approved before the bot responds.
- Full guide: [Security](https://docs.soloclaw.ai/gateway/security)

## From Source (Development)

Prefer `pnpm` for builds from source. Bun is optional for running TypeScript directly.

```bash
git clone https://github.com/soloclaw/soloclaw.git
cd soloclaw

pnpm install
pnpm ui:build   # auto-installs UI deps on first run
pnpm build

pnpm soloclaw onboard

# Dev loop (auto-reload on source/config changes)
pnpm gateway:watch
```

Note: `pnpm soloclaw ...` runs TypeScript directly (via `tsx`). `pnpm build` produces `dist/` for running via Node / the packaged `soloclaw` binary.

## License

MIT
