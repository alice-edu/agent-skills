# Links

The user switches between many threads, Slack and Linear. Every place a skill hands something to them carries the links that get them to the rest in one click.

## The Links line

Every report (just above waiting.md's `Snoozed until …` / `Settled.` line), and every question on a decision card, ends with one line holding each of these that exists for the work, in this order:

```
**Links:** [PR #723](…) · [Slack thread](…) · [ALI-10824](…) · [Diagram: <what it shows>](…)
```

- **PR**: its URL.
- **Slack thread**: the permalink of the PR's post in `#pr-review-channel` (slack.md, "Finding a PR's thread"), and, when the work started from one (the Linear issue holds its permalink, slack-report.md), the report's thread as **Report thread**.
- **Linear**: the issue's identifier, linked.
- **Diagram**: each one drawn for this work (diagrams.md), named by what it shows.

Leave out only a link confirmed not to exist: a PR not yet sent has no review thread, but the thread of a Slack report the work started from, or an existing PR's review thread, may already be there. Done when every link that exists is on the line, and each one was read from its source in this run (`gh pr view`, the Slack search, Linear), never guessed.

## The T3 link in Slack

So the user can go from a Slack thread to the T3 Code thread doing the work, each Slack thread a skill posts in gets a link to this T3 thread, once. Teammates see it too, so it goes in a reply of its own, after the skill's own message, never inside it:

```
T3 thread: [<this thread's title>](t3code://threads/<environmentId>/<threadId>)
```

- `environmentId`: `t3_environment_read`. `threadId`: `currentThreadId` from `t3_thread_list`.
- Before posting, read the Slack thread: when a `T3 thread:` reply already links this `threadId`, post nothing. One that links another thread (the work moved) gets a new reply.
- For a top-level post (`send-for-review`'s first round), the reply goes in that post's thread.

Outside T3 Code there is no thread to link: skip it.
