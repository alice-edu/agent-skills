---
name: why
description: 'Explain why code is shaped the way it is, from the record: the commits, PRs, review comments and issues that introduced it and each later change. Use when the user asks "why is this like this", "why does X exist", or before deleting code that looks pointless.'
---

# Why

Answer from the record, not the code. Follow the target back with `git log -L` or `git log --follow -p` and `git blame -w`, to each commit that introduced or changed it, then its PR (`gh pr list --search <sha> --state merged`), the PR's review comments, and the Linear issue or Slack thread it names. When that trail is thin, read the tests and docs from the same commits.

Quote what the authors wrote, with its link. Mark your own reading as **inferred**. Say what the record doesn't answer.

Adapted from poteto's [pstack](https://github.com/cursor/plugins/tree/main/pstack) (MIT).

**Reply**: the reason in one or two sentences, then each source a line with its link, then what's still unanswered.
