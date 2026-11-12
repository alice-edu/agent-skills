---
name: fix-comments
description: 'Work through a review of the user''s PR: an overview of what came back, fix what''s right, ask the user what''s theirs to decide, reply on every comment, and send it back for another round. Use when the user says "fix comments" or "address the feedback" on their PR, for the overview alone when they say "review''s back" or "what did they say", and from the nudge check when a review lands.'
---

# Fix comments

A reviewer has been through the user's PR. This answers every point they made (fixed, or kept with a reason the user agreed to), proves the fixes, and hands the PR back with a high chance of approval next round.

Shared files: [overview.md](~/.agents/pr-flow/overview.md), [github.md](~/.agents/pr-flow/github.md), [slack.md](~/.agents/pr-flow/slack.md), [ready.md](~/.agents/pr-flow/ready.md), [screenshots.md](~/.agents/pr-flow/screenshots.md), [decision-card.md](~/.agents/pr-flow/decision-card.md).

## 1. Gather every point

- The reviews on GitHub, the latest from each reviewer, and every inline thread without a reply from the user since.
- Top-level PR comments, bots' included (Copilot, CodeRabbit).
- The PR's Slack thread (slack.md), for anything said only there.

List each point once, with its link, what it asks, and its severity as the reviewer gave it. Done when every comment since the user's last round is on the list.

## 2. Sort them

Read the code each point is about and check the claim yourself; a reviewer's certainty is no evidence. Then give each point a row in the overview ([overview.md](~/.agents/pr-flow/overview.md)): its owner by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides", its kind, what it means, the recommendation, and the confidence with its evidence.

- ✅ **Fix**: the point is right. Its whole cause gets fixed in this PR. A point of a class an earlier round on this PR already fixed is a sign the approach is wrong: redesign it, as `review-loop`'s "A recurring class". A fix the reviewer suggests is a change like any other: read it through its callers before taking it.
- 💬 **Push back**: the claim is wrong, with evidence (a line, a test, a doc). A technical point the reviewer and the docs see differently is settled by the docs (lenses.md, "The technology's way").
- ⏭️ **Skip**: an optional point that doesn't matter for what the PR touches, with a short reason.

Every Push back and Skip is a reply that speaks for the user, so it goes on the card with its wording, whichever table it's in. A technical row below High: investigate until it's High (overview.md, "Confidence"), while the rest goes on.

Done when every point from step 1 has its row, every technical row is High or Stuck, and every row that matches [diagrams.md](~/.agents/pr-flow/diagrams.md)'s "When" has its diagram drawn and linked. A technical fix that turns out, while it's built, to change what a student sees or to grow the PR's scope moves to the product table and waits for the card.

## 3. The overview, and the card

Show the user the overview. Then:

- **Nothing on the card** (every row is technical, High and ✅ Fix): no question. Go on to step 4; the overview opens the report.
- **Otherwise**: one decision card: each product row, each Push back and Skip with its reply quoted, each Stuck row. Fixing the technical ✅ rows doesn't wait for it: start step 4 first and ask once that work is under way. Product rows wait for the answer.

For "review's back" or "what did they say", stop after the overview, with the card's questions in it: "say *fix comments* to go", the last line `In sight: <why>.` A later "fix comments" in the same thread starts from this overview when the review hasn't changed since.

## 4. Fix

1. Merge the base in first, so the fixes are proven on what will merge.
2. Fix each ✅ row, the whole of what it points at (the same problem in its sibling code too), the right way ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"): fix the shape a comment exposes rather than patching around it. A point that was a bug gets a test that fails without the fix.
3. Hold the PR to [ready.md](~/.agents/pr-flow/ready.md) again: rerun the checks the fixes touch, see a visible fix in the running app.
4. `review-loop` in **author** mode on the whole PR (the base merged in, to the head), from scratch, as if it were new: a fresh ledger, not one reused from an earlier run, with only the user's approved answers carried over; every lens that fits, the Backend lens through the repo's backend review doc when it touches the backend. On top of that, each fix this round gets a **regression** check: its callers, its sibling code and the tests around it, for what the fix could have broken. Fix what it finds the same way (items 2 and 3), whether or not the reviewer raised it, and list the new ones in the report. A regression a fix caused is fixed whatever its grade. Done when the loop agrees on the final head, every fix (the reviewer's and the loop's own) has had its regression check, and each regression found is fixed and proven. Budget spent with a P1 open: don't send it back; go to step 7, where the thread stays in sight.
5. Screenshots and GIFs retaken where something visible changed (screenshots.md), and the PR body updated: What changed, the checklist, Test by hand.

## 5. Push and reply

Push, then reply on every point (github.md): `Agreed, fixed in <sha>: …`, or the reason it's kept as the user approved it. Threads stay open for the reviewer.

Done when every point from step 1 has a reply on GitHub pointing at a pushed commit or giving its reason.

## 6. Send it back

Run `send-for-review`: it posts "ready for another round" in the thread and re-requests the reviewer.

## 7. Snooze, then report

Two actions, in this order, because the report is your last message and the turn ends with it:

1. **Snooze the thread.** When `send-for-review` posted, call `t3_thread_organize` with `action: "snooze"` and `snoozedUntil` 10:30 on the next working day, with the local offset (`date`; skip weekends and Danish public holidays, [waiting.md](~/.agents/pr-flow/waiting.md)). When it didn't post (a card unanswered, a red check of ours), the thread stays in sight: no call.
2. **Write the report** ([report.md](~/.agents/pr-flow/report.md)): the verdict first; the overview, updated, each row's outcome (fixed in <sha>, pushed back, skipped) and any rows the full review added; the head and CI's state; the **You:** line; the Links line ([links.md](~/.agents/pr-flow/links.md)); and last, where the thread went: `Snoozed until Wed 10:30.` or `In sight: <why>.`

Done when `t3_thread_organize` has answered (or the thread is in sight for a reason) and the report's last line says which.
