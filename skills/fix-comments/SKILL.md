---
name: fix-comments
description: 'Work through a review of the user''s PR: an overview of what came back, fix what''s right, ask the user what''s theirs to decide, reply on every comment, and send it back for another round. Use when the user says "fix comments" or "address the feedback" on their PR, for the overview alone when they say "review''s back" or "what did they say", and from the nudge check when a review lands.'
---

# Fix comments

A reviewer has been through the user's PR. This answers every point they made (fixed, or kept with a reason the user agreed to), proves the fixes, and hands the PR back with a high chance of approval next round.

Shared files: [overview.md](~/.agents/pr-flow/overview.md), [github.md](~/.agents/pr-flow/github.md), [slack.md](~/.agents/pr-flow/slack.md), [ready.md](~/.agents/pr-flow/ready.md), [screenshots.md](~/.agents/pr-flow/screenshots.md), [decision-card.md](~/.agents/pr-flow/decision-card.md).

## 1. Gather every point

- The reviews on GitHub, the latest from each reviewer, and every inline thread without a reply from the user since.
- Top-level PR comments, bots' included (Copilot, CodeRabbit), each settled by [bot-triage.md](~/.agents/pr-flow/bot-triage.md).
- The PR's Slack thread (slack.md), for anything said only there.

List each point once, with its link, what it asks, and its severity as the reviewer gave it. Done when every comment since the user's last round is on the list.

## 2. Sort them

Read the code each point is about and check the claim yourself; a reviewer's certainty is no evidence. Then give each point a row in the overview ([overview.md](~/.agents/pr-flow/overview.md)): its owner by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides", its kind, what it means, the recommendation, and the confidence with its evidence.

- ✅ **Fix**: the point is right. Its whole cause gets fixed in this PR. A point of a class an earlier round on this PR already fixed is a sign the approach is wrong: redesign it, as `review-loop`'s "A recurring class". A fix the reviewer suggests is a change like any other: read it through its callers before taking it.
- 💬 **Push back**: the claim is wrong, with evidence (a line, a test, a doc). A technical point the reviewer and the docs see differently is settled by the docs (lenses.md, "The technology's way").
- ⏭️ **Skip**: polish that doesn't matter for what the PR touches, with a short reason. A point that's a bug, however rare, is ✅ Fix, or 💬 Push back when it isn't reachable. A reviewer asking for a Not fixed row (pr-body.md) is ✅ Fix unless the user says otherwise on the card.

A technical Push back or Skip that the docs or the code settle at High is the agents' call (decision-card.md, "Who decides"): reply, and list it with its reply under **Decided**. Only a product row's Push back or Skip, or a technical one still below High, goes on the card with its wording. A technical row below High: investigate until it's High (overview.md, "Confidence"), while the rest goes on.

Done when every point from step 1 has its row, every technical row is High or Stuck, and every row that matches [diagrams.md](~/.agents/pr-flow/diagrams.md)'s "When" has its diagram drawn and linked. A technical fix that turns out, while it's built, to change what a student sees or to grow the PR's scope moves to the product table and waits for the card.

## 3. The overview, and the card

Show the user the overview. Then:

- **Nothing on the card** (every row is technical and High): no question. Go on to step 4; the overview opens the report.
- **Otherwise**: one decision card, asked as [decision-card.md](~/.agents/pr-flow/decision-card.md)'s "How to ask" says (read it first, pictures included): each product row, each Push back and Skip step 2 left for the card with its reply quoted, each Stuck row. Fixing the technical ✅ rows doesn't wait for it: start step 4 first and ask once that work is under way. Product rows wait for the answer.

For "review's back" or "what did they say", stop after the overview, with the card's questions in it: "say *fix comments* to go", the last line `In sight: <why>.` A later "fix comments" in the same thread starts from this overview when the review hasn't changed since.

## 4. Fix

1. Merge the base in first, so the fixes are proven on what will merge.
2. Fix each ✅ row, the whole of what it points at (the same problem in its sibling code too), the right way ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"): fix the shape a comment exposes rather than patching around it. A point that was a bug gets a test that fails without the fix.
3. Hold the PR to [ready.md](~/.agents/pr-flow/ready.md) again: rerun the checks the fixes touch, see a visible fix in the running app.
4. `review-loop` in **author** mode on what changed since the PR's agreed head (its step 1, "The agreed head"), the base merged in: the fixes through their callers, its ledger carried over with the user's approved answers; every lens that fits, the Backend lens through the repo's backend review doc when it touches the backend. On top of that, each fix this round gets a **regression** check: its callers, its sibling code and the tests around it, for what the fix could have broken. Fix what it finds the same way (items 2 and 3), whether or not the reviewer raised it, and list the new ones in the report. A regression a fix caused is fixed whatever its grade. Done when the loop agrees on the final head, every fix (the reviewer's and the loop's own) has had its regression check, and each regression found is fixed and proven. Budget spent with a P1 open: don't send it back; go to step 7, where the thread stays in sight.
5. **Log the misses**: each ✅ point that's a P1 by `review-loop`'s Severity, on code the PR's own loop had reviewed without raising it, gets a row in [misses.md](~/.agents/pr-flow/misses.md), so the loop is measured against it, committed on its own in the skills repo (`readlink ~/.agents/pr-flow`), never in the PR.
6. Screenshots and GIFs retaken where something visible changed, under new names, until `screenshots-stale` says current (screenshots.md, "Keep them current"), and the PR body updated: What changed, the checklist, Test by hand, and this thread's T3 line ([pr-body.md](~/.agents/pr-flow/pr-body.md), "Where it was made").

## 5. Push and reply

Push, then reply on every point (github.md): `Agreed, fixed in <sha>: …`, or the reason it's kept as the user approved it. Threads stay open for the reviewer.

Done when every point from step 1 has a reply on GitHub pointing at a pushed commit or giving its reason.

## 6. Send it back

Run `send-for-review`: it posts "ready for another round" in the thread and re-requests the reviewer.

## 7. Snooze, then report

Two actions, in this order, because the report is your last message and the turn ends with it:

1. **Snooze the thread.** When `send-for-review` posted, call `t3_thread_organize` with `action: "snooze"` and `snoozedUntil` 10:30 on the next working day, with the local offset (`date`; skip weekends and Danish public holidays, [waiting.md](~/.agents/pr-flow/waiting.md)). When it didn't post (a card unanswered, a red check of ours), the thread stays in sight: no call.
2. **Write the report** ([report.md](~/.agents/pr-flow/report.md)): the verdict first; the overview's rows as one table, each with its outcome in a few words (fixed, pushed back, skipped) and any rows the full review added; CI's state if it isn't green; the **You:** line; the Links line ([links.md](~/.agents/pr-flow/links.md)); and last, where the thread went: `Snoozed until Wed 10:30.` or `In sight: <why>.`

Done when `t3_thread_organize` has answered (or the thread is in sight for a reason) and the report's last line says which.
