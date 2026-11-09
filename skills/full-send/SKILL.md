---
name: full-send
description: 'Take the user''s approved PR the rest of the way: settle the last comments and conflicts, prove it, babysit it, merge it, and close the loop once it''s live. Use when the user says "full send" on an approved PR.'
---

# Full send

The PR is approved, with perhaps a few nits or a conflict left. The user isn't watching: this run owns it from here to merged and live, and merges only when confident. Every update goes unread until the end, so the report carries everything.

Shared files: [ready.md](~/.agents/pr-flow/ready.md), [github.md](~/.agents/pr-flow/github.md), [slack.md](~/.agents/pr-flow/slack.md), [decision-card.md](~/.agents/pr-flow/decision-card.md).

## The grant

"Full send" lets this run, without asking: fix, commit and push to the PR's own branch; run the app, browser tools and the repo's tests to prove it; merge once the merge gate passes. Anything else outside the repo (production data, another branch, closing a PR) goes on the decision card.

## 1. Read where it stands

The approvals and what each approved (`commit_id`), the nits left in them and inline, unanswered comments, CI on the head, and whether the branch is behind or conflicts with its base.

## 2. Settle what's left

- Merge the base in and resolve conflicts the way both sides meant.
- Take each nit that matters for what the PR touches; reply on the rest with a short reason (github.md). A reply that declines what a reviewer asked, or a nit that's the user's call ([decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides"), goes on the card.

### What still counts as approved

From the approval to the merge, only these go in without another review:

- the base merged in, with its conflicts resolved;
- cheap nits;
- small mechanical fixes for CI or a bot: a type error, a lint error, a flaky test.

Anything else was never approved: a P1 from `review-loop` (step 3) or a bot (step 4), a fix that changes behaviour, a diff that grows noticeably. Push the fix, run `send-for-review` saying what changed and why, `unwatch_pull_request`, and go to the report (step 6) without merging. When the right fix isn't clear, or would change what the PR does, put it on the card instead of writing it.

## 3. Prove it

Hold the head to [ready.md](~/.agents/pr-flow/ready.md), reusing what's still valid for it. When code changed since the approval, `review-loop` in **author** mode on the diff since the approved commit. Its fixes are held to "What still counts as approved".

## 4. Babysit to the gate

Push, then `babysit-pr`. The **merge gate**, all true on the latest head:

- proof covers every change in the diff;
- everything since the approval is in "What still counts as approved";
- required checks are green;
- every bot finding posted so far is fixed or answered with a reason (`babysit-pr`, "Bots": advisory ones aren't waited for);
- an approval stands, and no review still requests changes;
- the branch is up to date with its base, and GitHub reports it mergeable.

Merge with a merge commit (`gh pr merge <n> --merge`), the repo's habit, through branch protection as it's set. Not confident in the change, or the gate can't pass and the fix isn't ours to make: leave it unmerged and put it on the card.

## 5. Close the loop when it's live

Wait for the production deploy of the merge commit:

```bash
id=$(gh api "repos/<o>/<r>/deployments?sha=<merge sha>&environment=Production" --jq '.[0].id')
gh api repos/<o>/<r>/deployments/$id/statuses --jq '.[0].state'   # success | failure | in_progress …
```

- **success**: when the Linear issue holds the Slack permalink of the report the work started from (slack-report.md), post the **Live** message in that thread (slack.md) and resolve its PostHog issue, if any, with the PR link.
- **failure**: post nothing in that thread; main's deploy is broken, and the user hears about it first in the report.
- Still deploying when the run must end: post nothing, and say it's merged but not live yet.

## 6. Report

Once merged, delete its `Nudge PR #<n>` task, if any (`list_scheduled_tasks`, `delete_scheduled_task`; nudge.md).

Shaped by [report.md](~/.agents/pr-flow/report.md). Merged or not, the merge commit, the deploy's state, the proof, what was posted where, and **Decided**: every call made on the user's behalf. When the run stops before merging, `unwatch_pull_request` first, and start the report with why. End with the Links line ([links.md](~/.agents/pr-flow/links.md)).

Then put the thread where [waiting.md](~/.agents/pr-flow/waiting.md) says.
