# Slack

Every message is posted as the user, so write each in their voice: short and plain, the way they write in the channel (their own voice skill when they have one), then a pass for AI tells (an `unslop`-style skill, when they have one). Mention people as `<@USERID>` (find them with `slack_search_users`); the user's own ID is in [me.md](me.md). After posting, read the thread back and confirm the message is there once. Then add the T3 link ([links.md](~/.agents/pr-flow/links.md), "The T3 link in Slack").

## Channels

| Channel | ID | What's in it |
| --- | --- | --- |
| `#pr-review-channel` | `C09BGLX8JCF` | One top-level post a PR up for review; the rounds happen in its thread. |
| `#alice-labs-feedback` | `C0C7AB9PMQD` | PostHog survey replies from students (often Danish; `For:` names the teammate who owns that student), Kim's relayed feedback, Linear's "Created issue". |
| `#alice-labs-errors` | `C0C65T6G37T` | PostHog error-tracking alerts (each critical crash posts twice: "New issue" and "Critical"), slowness and usage-limit alerts, diagnoses in threads. |

## Finding a PR's thread

The thread is the top-level post in `#pr-review-channel` whose text holds the PR's URL. Search for `pull/<n>` in the channel (`slack_search_public_and_private`, `in:<#C09BGLX8JCF>`), or read its recent history. When a PR was folded into another (a stack collapsed), the thread may live under the other PR's post: read the replies. Done when one thread is found, or it's certain there is none.

## Messages

**Up for review** (top-level, `send-for-review`):

```
<One or two sentences, plain: what a student can do or no longer hits. Mention screenshots when the PR has them.>
+<additions>/-<deletions>
<PR title>
<PR url>

<Linear issue title>
<Linear issue url>
```

A named reviewer gets `<@id>` after the first line, with a reason when the user gave one ("fairly easy review", "would love this today").

**Ready for another round** (in the thread, `send-for-review`): `<@reviewer> ready for another round.` then what changed, one bullet a comment or group of comments: `Fixed in <sha>: …`, and `Kept <what>, reasons in its thread` for any declined. End with the state: replied on every comment, base merged in, CI's actual state on the head (green, or running), screenshots updated where they changed.

**Review done** (in the thread, `review-pr`): `<@author>` and the verdict first ("approved", "changes requested"). Then the P1s, one line each, what goes wrong for whom. The P2s as a count ("plus 3 optional nits inline"). Then the review's link. On a re-review, first what checked out from last time.

**Looking into it** (in the report's own thread, `build-it` started from Slack): one line, `Looking into this: <Linear url>`. No promise of a fix.

**Live** (in the issue's own thread, `full-send`, after the production deploy): what's different for the student now, in one or two sentences, the PR link, and `<@owner>` from the report's `For:` so they can tell the student.
