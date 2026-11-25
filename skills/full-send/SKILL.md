---
name: full-send
description: 'Take the user''s approved PR the rest of the way: settle the last comments and conflicts, prove it, babysit it, merge it, and close the loop once it''s live. Use when the user says "full send" on an approved PR.'
---

# Full send

The PR is approved, with perhaps a few nits or a conflict left. The user isn't watching, an unattended run ([decision-log.md](~/.agents/pr-flow/decision-log.md)): this run owns it from here to merged and live, and merges only when confident. Every update goes unread until the end, so the report carries everything.

Shared files: [ready.md](~/.agents/pr-flow/ready.md), [github.md](~/.agents/pr-flow/github.md), [slack.md](~/.agents/pr-flow/slack.md), [decision-card.md](~/.agents/pr-flow/decision-card.md), [branches.md](~/.agents/pr-flow/branches.md).

## The grant

"Full send" lets this run, without asking: fix, commit and push to the PR's own branch; run the app, browser tools and the repo's tests to prove it; merge once the merge gate passes. Anything else outside the repo (production data, another branch, closing a PR) goes on the decision card.

## 1. Read where it stands

The approvals and what each approved (`commit_id`), the nits left in them and inline, unanswered comments, CI on the head, and whether the branch is behind or conflicts with its base.

Find the PR's Slack thread (slack.md, "Finding a PR's thread") and react 🙌 on the reviewer's approval message in it, or on the **Up for review** post when the approval was only on GitHub (slack.md, "Reactions").

## 2. Settle what's left

- Merge the base in and resolve conflicts the way both sides meant.
- Fix each P2 bug a reviewer left (review-loop, "Severity"); take polish that matters for what the PR touches; reply on the rest with a short reason (github.md). A reply that declines what a reviewer asked, or a nit that's the user's call ([decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides"), goes on the card.

### What still counts as approved

The default is to merge. An approval covers the change while it keeps the **shape** the reviewer approved: the same approach, in the same areas. So these go in without another review:

- what the reviewer asked for, in their approval or its comments, behaviour changes included;
- the base merged in, with its conflicts resolved; nits; fixes for CI or a bot;
- fixes from our own checks (a `review-loop` P1 in step 3, a FAIL from the student check, a bot's bug) that fix the approved approach without replacing it.

Only a change of shape goes back to the reviewer: a new approach or redesign, a feature or ask they never saw, most of the approved diff rewritten, a new area the PR didn't touch before (backend, auth, money, the data model), or the reviewer asked to see it again or requests changes. Then push it, run `send-for-review` saying what changed and why, `unwatch_pull_request`, and go to the report (step 6) without merging. Measured: of 20 approved PRs sent back for changes like the first list, 5 re-reviews were an approval with no comments and most got none (2026-11-24).

**Tell the reviewer** what went in after their approval, in one comment on the PR when it merges (github.md's voice): `Merged with your suggestions. Since your approval: <each change in a line, with its commit>.` so they can look afterwards.

## 3. Prove it

Hold the head to [ready.md](~/.agents/pr-flow/ready.md), reusing what's still valid for it. When code changed since the approval, `review-loop` in **author** mode on the diff since the approved commit. Its fixes are held to "What still counts as approved".

Then a **verdict from an agent that didn't write it**, when a student can see the change: a fresh subagent, told to read `~/.agents/pr-flow/worker.md` first and given only the PR's intent, its behaviour table, the running app's link and ready.md's "Proof", which uses the change as a student would and answers PASS or FAIL with what it saw (screenshots). For a small change (ready.md, "A small change"), one pass over the changed screen. FAIL is fixed like a P1. The verdict holds while the change's patch id does (review-loop, "The agreed head"); a fix or merge in step 4 that changes it means a new verdict.

## 4. Babysit to the gate

Push, then `babysit-pr`. The **merge gate**, all true on the latest head:

- proof covers every change in the diff, and `screenshots-stale` says current;
- when a student can see the change, the non-author verdict (step 3) is PASS for the latest head's patch id;
- everything since the approval keeps the approved shape ("What still counts as approved");
- required checks are green (`phone-native` red: branches.md, "phone-native red"; a native PR waiting for its store build stops here, `In sight`);
- every bot finding posted so far is fixed or answered with a reason (`babysit-pr`, "Bots": advisory ones aren't waited for);
- an approval stands, and no review still requests changes;
- the branch is up to date with its base, and GitHub reports it mergeable.

Merge with a merge commit (`gh pr merge <n> --merge`), the repo's habit, through branch protection as it's set, then post the reviewer's comment ("What still counts as approved"). Not confident in the change, or the gate can't pass and the fix isn't ours to make: leave it unmerged and put it on the card.

## 5. Close the loop when it's live

Wait only when something waits on it being live: a Slack report thread or PostHog issue to close, a deploy hand test, or the phone's update when the PR changed what the phone bundles (branches.md). Otherwise the deploy runs on its own: report it merged, deploying, and settle. When something waits, wait for the production deploy of the merge commit:

```bash
id=$(gh api "repos/<o>/<r>/deployments?sha=<merge sha>&environment=Production" --jq '.[0].id')
gh api repos/<o>/<r>/deployments/$id/statuses --jq '.[0].state'   # success | failure | in_progress …
```

- **success** (and the phone's update, when there is one): when the Linear issue holds the Slack permalink of the report the work started from (slack-report.md), post the **Live** message in that thread (slack.md) and resolve its PostHog issue, if any, with the PR link.
- **failure**: post nothing in that thread; main's deploy is broken, and the user hears about it first in the report.
- **The phone's update red** (deploy success): post nothing in that thread; the report says the web is live and the phone's update failed, with its run.
- Still deploying when the run must end: post nothing, and say it's merged but not live yet.
- **A deploy hand test** in the PR's Test by hand (only production has it): once live, ask it of the user (ready.md, "A hand test blocks on the user"), set up on production, and tick it with their answer.

## 6. Settle, then report

Once merged, react ✅ on the PR's **Up for review** post (slack.md, "Reactions"). Under auto-merge, when the turn ends before the merge, the PR's thread reacts when its next check finds it merged (nudge.md, rule 1).

Two actions, in this order, because the report is your last message and the turn ends with it:

1. **Put the thread away.** Merged, and live when step 5 waited for it (the Slack thread told when there was one): `t3_thread_organize` with `action: "settle"`. Sent back for review (step 2): `action: "snooze"` and `snoozedUntil` 10:30 on the next working day, with the local offset. Anything else (stopped before merging, or step 5 waited and it isn't live yet): the thread stays in sight, no call.
2. **Write the report**, shaped by [report.md](~/.agents/pr-flow/report.md). Merged or not, whether it's live (measured, from the deploy's check), and **Decided**: every call made on the user's behalf. What was posted where is the Links line. When the run stops before merging, `unwatch_pull_request` first, and start the report with why. Then the Links line ([links.md](~/.agents/pr-flow/links.md)), and last, where the thread went: `Settled.`, `Snoozed until Wed 10:30.` or `In sight: <why>.`

Done when `t3_thread_organize` has answered (or the thread is in sight for a reason) and the report's last line says which ([waiting.md](~/.agents/pr-flow/waiting.md)).
