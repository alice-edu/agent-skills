---
name: review-pr
description: 'Review a teammate''s PR with Claude and Codex, post the review on GitHub and in its Slack thread. Use when the user says "review this" or "ready for another look" about someone else''s PR.'
---

# Review PR

A teammate's PR, reviewed as the user would: Claude and Codex both read it, the verdict blocks only on what's really wrong, and anything that's a matter of opinion is the user's call before it's posted. Each run is one **round**; the author fixes, says so in Slack, and the user says "another look" for the next.

Shared files: [overview.md](~/.agents/pr-flow/overview.md) (how it's shown to the user), [github.md](~/.agents/pr-flow/github.md) (how the review is written and posted), [slack.md](~/.agents/pr-flow/slack.md) (the thread and the reply), [decision-card.md](~/.agents/pr-flow/decision-card.md) (asking the user).

## 1. Resolve the round

- The PR: from the link, or the Slack thread the user pointed at. Its head SHA, base branch, author.
- Its thread in `#pr-review-channel` (slack.md, "Finding a PR's thread"), and everything said in it.
- The linked Linear issue, read for intent only. Its status and owner stay as they are.
- The user's earlier reviews (`gh api repos/<o>/<r>/pulls/<n>/reviews`, by `gh api user --jq .login`). None: **round 1**. Otherwise a **re-review**, against the `commit_id` of their last one.
- A PR stacked on another (its base isn't `main`): review this layer's diff against its base, and note the order they merge in.

Done when PR, head, round, thread (or none) and intent are known.

## 2. Review and explain, side by side

Start `review-loop` in **reviewer** mode. On a re-review its scope is the user's open threads (each: did the author's fix or reply settle it?) plus the diff from the last reviewed commit to the head; the claims in the author's "ready for another round" message are checked against the code, one by one.

While it runs, on round 1, write the user the **explanation**, in plain words, for someone who hasn't read the diff:

- what a student saw before and sees now (or, for internal work, what a teammate does differently);
- how it works, in three to five sentences, naming the two or three functions or files that carry it;
- the one design decision in it, and what it chose against;
- where the risk is, and the file to read first;
- what the author says wasn't tested.

Add a **diagram** per [diagrams.md](~/.agents/pr-flow/diagrams.md) when the change matches its "When" (in doubt, draw it); its public link (and screenshot, when it reads at PR width) goes in the GitHub review. On a re-review, reuse its scene and redraw only when the structure changed.

When the user asked for a student test (`student-test`), run it beside `review-loop` on the PR's head, in reviewer mode.

Done when `review-loop` has stopped (and the student test, when one runs), its Backend lens has gone through every section of the repo's backend review doc when the PR touches the backend (in Alicia, `docs/backend-review.md`), and, on round 1, the explanation is written with its diagram when the change matches diagrams.md's "When".

## 3. Decide the verdict

From the ledger:

- an open P1: **changes requested**;
- only P2s, or nothing: **approve**, the P2s posted as optional. A rare edge case is approved with the note that it's optional; a cheap one can carry "worth fixing before merge" and still be an approval;
- on a re-review, earlier findings the author settled are said to check out.

Draft the whole review now: body and every inline comment, worded as github.md says.

## 4. Ask the user, when there's something to ask

Show the user the explanation, then the ledger as an overview ([overview.md](~/.agents/pr-flow/overview.md)): one row a finding, 🔴 Blocking for a P1, 🟡 Optional for a P2, ⚪ Drop for one not worth posting, with a diagram linked on each row that matches diagrams.md's "When" (the explanation's, or one drawn for the finding: a fix that reworks a flow or a cost). The drafted review follows, folded. Then, if any of these exist, one decision card with all of them:

- the product table's rows: post as blocking, optional, or drop;
- a finding the loop returned Stuck (still disputed, or the budget spent with a P1 open);
- the verdict, when it rests on one of those.

No such items: carry on and post. The user's answers adjust the draft.

## 5. Post

Post the review in one call pinned to the head, and read it back until GitHub shows the intended state at that commit (github.md). Then reply in the Slack thread (slack.md, "Review done"), linking the review. No Slack thread: say so in the report rather than starting one.

Done when GitHub shows the review's state at the head, the Slack reply is in the thread once, and (in T3 Code) the thread has a `T3 thread:` reply linking this thread (links.md).

## 6. Snooze or settle, then report

Two actions, in this order, because the report is your last message and the turn ends with it:

1. **Put the thread away.** Changes requested: `t3_thread_organize` with `action: "snooze"` and `snoozedUntil` 3 hours from now (`date -u -v+3H +%Y-%m-%dT%H:%M:%SZ`). Approved: `action: "settle"`. Nothing posted yet (a card unanswered): the thread stays in sight, no call.
2. **Write the report**, shaped by [report.md](~/.agents/pr-flow/report.md). The explanation and diagram (round 1), the overview with each row as posted, each lens's result (Spec, Correctness, Standards, Backend, UI and UX: [lenses.md](~/.agents/pr-flow/lenses.md)), the review's link, anything decided on the user's behalf. When it wasn't a council and the PR changes the data model, a workflow, auth or a migration, suggest one: "say *council* for four models on it". When it adds or reworks a flow a student goes through and had no student test, suggest "say *student test*". When its UI and UX lens questions a layout or flow choice on a screen the PR adds or reworks, suggest "say *sketch it* to see the PR's screen beside alternatives" (sketch-it, "From a review"). When changes were requested, the **You:** line is "When they've pushed, say *another look*." Then the Links line ([links.md](~/.agents/pr-flow/links.md)), and last, where the thread went: `Snoozed until 14:30.`, `Settled.` or `In sight: <why>.`

Done when `t3_thread_organize` has answered (or the thread is in sight for a reason) and the report's last line says which ([waiting.md](~/.agents/pr-flow/waiting.md)).
