---
summary: "Redirect: flow commands live under `soloclaw tasks flow`"
read_when:
  - You encounter openclaw flows in older docs or release notes
title: "flows (redirect)"
---

# `soloclaw tasks flow`

Flow commands are subcommands of `soloclaw tasks`, not a standalone `flows` command.

```bash
openclaw tasks flow list [--json]
openclaw tasks flow show <lookup>
openclaw tasks flow cancel <lookup>
```

For full documentation see [Task Flow](/automation/taskflow) and the [tasks CLI reference](/cli/index#tasks).
