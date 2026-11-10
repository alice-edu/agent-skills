---
name: send-for-review
description: 'Post the user''s PR in #pr-review-channel for review, or tell the reviewer in its thread that it''s ready for another round. Use when the user says "send for review" or "send it", for the check alone when they ask "is it ready?", and at the end of fix-comments.'
---

# Send for review

The one place the user's PRs are announced for review: the first post in `#pr-review-channel`, and each "ready for another round" in its thread after. It makes sure the PR is ready before saying so, reviewing whatever changed since the last review.

Shared files: [slack.md](~/.agents/pr-flow/slack.md), [ready.md](~/.agents/pr-flow/ready.md), [github.md](~/.agents/pr-flow/github.md), [decision-card.md](~/.agents/pr-flow/decision-card.md).

## 1. Resolve it

The PR (from the link, or the current branch's), its head, `additions`, `deletions`, title and URL (`gh pr view --json`), its Linear issue, and its thread in `#pr-review-channel` (slack.md). No thread: **first round**. A thread: **another round**, and its reviewer is whoever reviewed on GitHub or in the thread.

## 2. Make it ready

[ready.md](~/.agents/pr-flow/ready.md), "Make it ready", on the current head: anything committed since `review-loop` last agreed is reviewed with the whole PR, proven again, and written into the PR body; the base is merged in; CI is green or running on this head. Push what it changes.

What can't be made ready (a P1 the loop can't settle, a red check that isn't ours, a test that needs something we don't have) goes on the decision card: send it saying so, or wait.

Asked only "is it ready?": post nothing, and go to step 4 with the verdict, what the review fixed, and what's left.

Done when every checklist item is true for the head being announced.

## 3. Post

**First round**: the **Up for review** post (slack.md), top-level in `#pr-review-channel`. When the user named a reviewer, also request them on GitHub (github.md).

**Another round**: the **Ready for another round** reply in the thread, @mentioning the reviewer, built from the fixes and replies on the PR since their last review. Re-request them on GitHub.

Either way, add the T3 link in the thread ([links.md](~/.agents/pr-flow/links.md), "The T3 link in Slack"): on the first round, a reply under the post. Then set the Linear issue to **In Review**, and set up the nudge ([nudge.md](~/.agents/pr-flow/nudge.md), "Setting it up").

Done when the message is in Slack once, exactly one `Nudge PR #<n>` task is scheduled with its own id in its prompt (in T3 Code), the thread has a `T3 thread:` reply linking this thread (in T3 Code), the reviewer is requested on GitHub where there is one, and Linear reads In Review.

## 4. Snooze, then report

Run from another skill (`fix-comments`, `full-send`): report what was posted and hand back; the outer skill puts the thread away. On its own, two actions, in this order, because the report is your last message and the turn ends with it:

1. **Snooze the thread.** When it posted, call `t3_thread_organize` with `action: "snooze"` and `snoozedUntil` 10:30 on the next working day, with the local offset (`date`; skip weekends and Danish public holidays, [waiting.md](~/.agents/pr-flow/waiting.md)). When it didn't (asked only "is it ready?", or not ready), the thread stays in sight: no call.
2. **Write the report** ([report.md](~/.agents/pr-flow/report.md)): one or two lines on what was posted, the **You:** line, the Links line ([links.md](~/.agents/pr-flow/links.md)), and last, where the thread went: `Snoozed until Wed 10:30.` or `In sight: <why>.`

Done when `t3_thread_organize` has answered (or the thread is in sight for a reason) and the report's last line says which.
