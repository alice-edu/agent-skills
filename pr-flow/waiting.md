# Waiting

Where a thread goes when its skill ends, so the user's T3 list shows only threads where the next move is their. **Snooze** when the next move is someone else's and the work comes back; **settle** when nothing is left for the user; leave it in sight when they have to act.

| The skill ended with | The thread |
| --- | --- |
| `send-for-review` posted (also how `fix-comments` ends): waiting for the reviewer | snoozed until 10:30 on the next working day, just after the nudge check ([nudge.md](nudge.md)), which snoozes it again until there's a review or a decision for the user |
| `review-pr` requested changes: waiting for the author | snoozed 3 hours |
| `review-pr` approved | settled |
| `full-send` merged and live, with the report's Slack thread told when there was one | settled |
| `build-it` parked it (unconfirmed, or a big feature left in Linear), or found it already done | settled |
| anything else: a decision card unanswered, a blocker, a red check, merged but not live, a PR not yet sent | in sight |

## How

In T3 Code, as the skill's last action before its report: the report is the turn's last message, so an action after it never runs. Each skill's last step names its own outcome; this table is where they come from.

For a time of day (10:30 on the next working day, nudge.md), work out the date, skipping weekends and Danish public holidays, and give it with the local offset. For hours from now:

```bash
date -u -v+3H +%Y-%m-%dT%H:%M:%SZ   # macOS; GNU date: date -u -d '+3 hours' +%Y-%m-%dT%H:%M:%SZ
```

- Snooze: `t3_thread_organize` with `action: "snooze"` and that time as `snoozedUntil`, no `threadId` (this thread).
- Settle: `t3_thread_organize` with `action: "settle"`.

When one skill runs another (`fix-comments` runs `send-for-review`, `full-send` runs `babysit-pr`), only the outer one does this, by how the whole chain ended.

A thread that watches a PR (`babysit-pr`) unwatches before either. Outside T3 Code there's no thread list to tidy: this step is skipped.

The report's last line says where the thread went: `Snoozed until 14:30.` (local time), `Settled.`, or `In sight: <why>.`

## Waiting on CI

Every skill that waits on a PR's checks or reviews waits this way: one watcher a PR, never a `sleep` loop or repeated `gh pr checks`. Before ending the turn, write what the wake should pick up ("on a wake: fix a red check the merge caused"), since the next turn resumes from there.

- **In T3 Code**: handle what's already there, then `watch_pull_request` and end the turn. T3 wakes the thread when a check fails, the required checks pass, someone comments or reviews, or the branch conflicts. A wake is news; check the gate yourself. Only the thread that owns the PR watches it: a delegated child never does. Before handing back (ready, blocked, or asking), `unwatch_pull_request`, except where a skill watches on past its report until CI finishes (`send-for-review`'s "Checks still running", `catch-up`'s step 4): there the green wake unwatches. "Could not read it" usually means GitHub's GraphQL limit is spent: `gh api rate_limit --jq .resources.graphql`, and wait for its `reset` once before watching again.
- **Elsewhere**: `~/.agents/skills/babysit-pr/scripts/pr-wait <pr> --until ready`, run with Claude Code's Monitor tool, or as one long command. One line a real event; exit 0 when the condition is met or the PR merged, 1 when it needs you, 2 on bad input. Start it again after each push.

An event that needs nothing: end the turn without a message.
