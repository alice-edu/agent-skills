# Slack

Every message is posted as the user, so write each in their voice: short and plain, the way they write in the channel (their own voice skill when they have one), then the `unslop` skill over it before it's posted. Mention people as `<@USERID>` (find them with `slack_search_users`); the user's own ID is in [me.md](me.md). After posting, read the thread back and confirm the message is there once. Then add the T3 link ([links.md](~/.agents/pr-flow/links.md), "The T3 link in Slack").

## Channels

| Channel | ID | What's in it |
| --- | --- | --- |
| `#pr-review-channel` | `C09BGLX8JCF` | One top-level post a PR, or a stack, up for review; the rounds happen in its thread. |
| `#alice-labs-feedback` | `C0C7AB9PMQD` | PostHog survey replies from students (often Danish; `For:` names the teammate who owns that student), Kim's relayed feedback, Linear's "Created issue". |
| `#alice-labs-errors` | `C0C65T6G37T` | PostHog error-tracking alerts (each critical crash posts twice: "New issue" and "Critical"), slowness and usage-limit alerts, diagnoses in threads. |

## Finding a PR's thread

The thread is the top-level post in `#pr-review-channel` whose text holds the PR's URL. Read the channel's history back to when the PR was opened (`slack_read_channel` with `oldest`) and match `alicia/pull/<n>` in each post: Slack's search misses these links, and the bare number is noisy. When a PR was folded into another (a stack collapsed), the thread may live under the other PR's post: read the replies. Done when one thread is found, or it's certain there is none.

## Reactions

A reaction tracks where a PR is, in the channel itself, so anyone scanning it sees what's under way without opening a thread. Each is added in the user's name with `slack_add_reaction`, at the moment its step happens, never ahead of it:

| Reaction | On | When | Skill |
| --- | --- | --- | --- |
| 👀 `eyes` | the teammate's **Up for review** post | a first review starts | `review-pr`, step 1 |
| 👀 `eyes` | the teammate's **Ready for another round** message in the thread | a re-review starts | `review-pr`, step 1 |
| 🙌 `raised_hands` | the reviewer's approval message in the thread (none: the **Up for review** post) | `full-send` starts on it | `full-send`, step 1 |
| ✅ `white_check_mark` | the user's own **Up for review** post | the PR is merged, by anyone | `full-send` after the merge; the nudge check (nudge.md) when it finds it merged |

A message that's gone or can't be found: skip its reaction and say so in the report.

## Messages

**Up for review** (top-level, `send-for-review`):

```
<One or two sentences, plain: what a student can do or no longer hits. Mention screenshots or a GIF when the PR has them.>
<<PR url>|<PR title>> · +<additions>/-<deletions>
<<Linear issue url>|ALI-123>
```

The Linear issue is its identifier, linked, never its title: the PR's title already says it.

A named reviewer gets `<@id>` after the first line, with a reason when the user gave one ("fairly easy review", "would love this today").

**Up for review, a stack** (top-level, `send-for-review`, for PRs that build on each other): one post for the whole stack, bottom first, and one thread for all its rounds.

```
Stack of <n> on <what they add up to, a few words>. Review in order, each builds on the one before:
1. <<PR url>|<short title>> · +<additions>/-<deletions> · <<Linear issue url>|ALI-123>
2. …
```

A named reviewer as above. In the thread, a **Ready for another round** names the layer each fix is in.

**Ready for another round** (in the thread, `send-for-review`): `<@reviewer> ready for another round.` then what changed, one bullet a comment or group of comments: `Fixed in <sha>: …`, and `Kept <what>, reasons in its thread` for any pushed back on or skipped as polish. End with the state: replied on every comment, base merged in, CI's actual state on the head (green, or running), screenshots updated where they changed.

**Review done** (in the thread, `review-pr`): `<@author>` and the verdict first ("approved", "changes requested"). Then the P1s, one line each, what goes wrong for whom. The P2s as counts ("plus 2 bugs worth fixing and 3 optional nits inline"). Then the review's link. On a re-review, first what checked out from last time.

**Waiting for review** (top-level, the review digest): shape and rules in [digest.md](digest.md).

**Looking into it** (in the report's own thread, `build-it` started from Slack): one line, `Looking into this: <Linear url>`. No promise of a fix.

**Live** (in the issue's own thread, `full-send`, after the production deploy): what's different for the student now, in one or two sentences, the PR link, and `<@owner>` from the report's `For:` so they can tell the student.
