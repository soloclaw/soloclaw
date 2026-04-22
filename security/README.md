# Security Analysis

This document analyzes the security posture of SoloClaw's plugins, tools, and skills.

## Overview

SoloClaw runs locally on your machine with full host access by default. Understanding the security level of each component helps you make informed decisions about what to enable.

## Risk Levels

| Level | Meaning |
|-------|---------|
| **Low** | Read-only or sandboxed. No external network access. No file mutation. |
| **Medium** | Can read/write files or make local network calls. Scoped to specific functions. |
| **High** | Full host access, external network calls, or can execute arbitrary commands. |

## Plugins

Plugins run inside the gateway process with full Node.js access.

| Plugin | Risk | Reason |
|--------|------|--------|
| **ollama** | Medium | Makes HTTP calls to local Ollama server. Sends prompts and receives responses. No external network. |
| **browser** | High | Launches and controls a Chromium process. Can navigate to any URL, read page content, execute JavaScript. |
| **searxng** | Medium | Makes HTTP calls to local SearXNG Docker container. No credentials sent externally. |
| **duckduckgo** | Medium | Makes HTTP calls to DuckDuckGo's HTML endpoint. Scrapes public search results. Your queries are sent to DuckDuckGo servers. |
| **telegram** | High | Connects to Telegram API with your bot token. Can read/send messages. Exposes bot token in config. |
| **discord** | High | Connects to Discord API with your bot token. Can read/send messages, manage channels, roles. Exposes bot token in config. |
| **device-pair** | Medium | Manages WebSocket connections for device pairing. Loopback only by default. |
| **acpx** | High | Agent Communication Protocol. Can spawn sub-agents with full host access. |
| **memory-core** | Medium | Reads/writes to local vector database (LanceDB). No external network. |
| **active-memory** | Low | In-memory state management. No persistence, no network. |

## Tools

Tools are functions the LLM can call. The LLM decides when and how to use them.

| Tool | Risk | Reason |
|------|------|--------|
| **bash** | **Critical** | Executes arbitrary shell commands on your machine. Can read/write/delete any file, install software, access network. The most powerful and dangerous tool. |
| **read** | Low | Reads file contents. Cannot modify files. |
| **write** | High | Creates or overwrites files anywhere on the filesystem. |
| **edit** | High | Modifies existing files. Can change any file the user has access to. |
| **apply_patch** | High | Applies code patches to files. Same risk as edit. |
| **web_search** | Medium | Sends search queries to configured search provider (SearXNG/DuckDuckGo). Queries are visible to the search provider. |
| **web_fetch** | Medium | Fetches content from any URL. Can access internal network resources if not properly restricted. |
| **browser** | High | Opens URLs in agent-controlled Chromium. Can interact with authenticated sessions if using the "user" profile. |
| **cron** | High | Schedules recurring tasks that run with full host access. |
| **sessions_spawn** | High | Creates sub-agent sessions with full tool access. |
| **sessions_send** | Medium | Sends messages to other sessions. Cannot execute tools directly. |
| **sessions_list / sessions_history** | Low | Read-only session information. |
| **message** | Medium | Sends messages to configured channels (Telegram/Discord). |
| **discord** | Medium | Discord-specific actions (reactions, messages, channel management). |
| **gateway** | High | Can restart the gateway service. |
| **memory_search / memory_get** | Low | Read-only access to memory store. |
| **canvas** | Medium | Controls canvas UI surface. Can execute JavaScript in canvas context. |
| **nodes** | Medium | Interacts with paired devices (camera, notifications). |

## Skills

Skills are markdown instruction files — they don't execute code directly. However, they instruct the LLM to use tools, so their effective risk depends on which tools they recommend.

| Skill | Effective Risk | Tools Used | Notes |
|-------|---------------|------------|-------|
| **weather** | Low | bash (curl) | Read-only HTTP request |
| **github / gh-issues** | Medium | bash (gh CLI) | Can read/write repos, issues, PRs |
| **apple-notes** | Medium | bash (osascript) | Can read/write Apple Notes |
| **apple-reminders** | Medium | bash (osascript) | Can read/write Apple Reminders |
| **spotify-player** | Low | bash (spotify_player) | Controls local Spotify playback |
| **peekaboo** | Low | bash (screencapture) | Takes screenshots |
| **nano-pdf** | Low | bash (pdftotext) | Reads PDF files |
| **notion** | Medium | bash (notion CLI) | Reads/writes Notion pages |
| **obsidian** | Medium | read/write | Reads/writes Obsidian vault files |
| **things-mac** | Medium | bash (osascript) | Reads/writes Things 3 tasks |
| **trello** | Medium | bash (trello CLI) | Reads/writes Trello boards |
| **tmux** | High | bash (tmux) | Can create/manage terminal sessions |
| **coding-agent** | High | bash, read, write, edit | Full code generation and execution |
| **skill-creator** | High | write | Creates new skill files that can instruct the LLM to use any tool |
| **summarize** | Low | read | Reads and summarizes text |
| **himalaya** | Medium | bash (himalaya) | Can read/send email |
| **camsnap** | Low | nodes (camera) | Takes camera snapshots via paired device |
| **gifgrep** | Low | bash (gifgrep) | Searches GIF databases |
| **video-frames** | Low | bash (ffmpeg) | Extracts video frames |
| **model-usage** | Low | read | Reads usage statistics |
| **session-logs** | Low | read | Reads session transcripts |
| **healthcheck** | Low | bash (curl) | Checks service health |

## Key Risks

### 1. Bash tool is the biggest risk
The `bash` tool can execute any command. A compromised or hallucinating LLM could:
- Delete files (`rm -rf`)
- Exfiltrate data (curl to external server)
- Install malware
- Access credentials in environment variables

**Mitigation:** SoloClaw is designed for single-user, local use. The LLM operates with your user permissions.

### 2. External network exposure
- **Telegram/Discord** expose bot tokens and relay messages through external servers
- **DuckDuckGo** sends search queries to external servers
- **web_fetch** can access any URL including internal services
- **SearXNG** (when self-hosted) keeps searches local

**Mitigation:** Use SearXNG over DuckDuckGo for private search. Be cautious about what you discuss on Telegram/Discord channels.

### 3. Skill injection
Skills are markdown files that instruct the LLM. A malicious skill could:
- Instruct the LLM to exfiltrate data
- Override safety guidelines
- Install additional tools

**Mitigation:** Only install skills from trusted sources. Review SKILL.md contents before installing.

### 4. Model hallucination
Local models can hallucinate tool calls, potentially:
- Running unintended commands
- Accessing wrong files
- Making requests to unexpected URLs

**Mitigation:** Use the largest model your hardware supports — larger models hallucinate less.

## Recommendations

1. **Keep gateway on loopback** — don't expose to LAN/internet unless needed
2. **Review skills before installing** — read the SKILL.md file
3. **Use SearXNG over DuckDuckGo** — keeps searches local
4. **Regenerate bot tokens periodically** — especially if exposed in logs
5. **Don't run sensitive commands through the AI** — use a regular terminal for credentials, secrets
6. **Monitor gateway logs** — `~/.soloclaw/logs/gateway.log`
