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

In T3 Code, as the skill's last action, after its report is written:

For a time of day (10:30 on the next working day, nudge.md), work out the date, skipping weekends and Danish public holidays, and give it with the local offset. For hours from now:

```bash
date -u -v+3H +%Y-%m-%dT%H:%M:%SZ   # macOS; GNU date: date -u -d '+3 hours' +%Y-%m-%dT%H:%M:%SZ
```

- Snooze: `t3_thread_organize` with `action: "snooze"` and that time as `snoozedUntil`, no `threadId` (this thread).
- Settle: `t3_thread_organize` with `action: "settle"`.

When one skill runs another (`fix-comments` runs `send-for-review`, `full-send` runs `babysit-pr`), only the outer one does this, by how the whole chain ended.

A thread that watches a PR (`babysit-pr`) unwatches before either. Outside T3 Code there's no thread list to tidy: this step is skipped.

The report's last line says where the thread went: `Snoozed until 14:30.` (local time) or `Settled.`
