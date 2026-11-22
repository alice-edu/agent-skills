---
name: how
description: 'Explain how a part of the codebase works, well enough to start working in it. Use when the user asks "how does X work", "walk me through X" or "where does X happen".'
---

# How

When the scope is unclear, say how you read it and go on: the user can redirect.

Start one read-only subagent with the question and this brief:

> Write an architectural explanation of this for a senior engineer who doesn't know this area. Read the code and its docs (the repo's `AGENTS.md` and what it points to) and explain it well enough that they could start working in it: the data it holds and where, the path a request or event takes through it, who calls it, and what would surprise them. Cite `file:line` for each claim, and name what you couldn't find. Read only; edit nothing.

Show its answer with light edits for what this thread already knows. Don't rewrite it.

Adapted from poteto's [pstack](https://github.com/cursor/plugins/tree/main/pstack) (MIT).
