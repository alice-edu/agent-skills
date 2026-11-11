---
name: catch-up
description: 'Bring a stale thread''s branch up to date: merge the base in, resolve conflicts, fix what the merge broke, and prove it still works, asking the user only for real decisions. Use when the user says "catch up", "get it up to date" or "freshen up" in a thread.'
---

# Catch up

This thread's work went stale while `main` moved on. Bring its branch to today's base with the change still doing what it did, so the user can carry on from here. The user sends this and leaves, so do everything that needs no decision first, and ask them once at the end.

Shared files: [ready.md](~/.agents/pr-flow/ready.md), [github.md](~/.agents/pr-flow/github.md), [decision-card.md](~/.agents/pr-flow/decision-card.md).

## The grant

"Catch up" lets this run, without asking: merge the base into this thread's branch, resolve conflicts, fix what the merge broke, commit, and push to the branch's own PR; run the repo's checks and the app to prove it. It never rebases or force-pushes, never merges the PR, and posts nothing in Slack: a reviewer hears about it when the user sends it for review.

## 1. Read where it stands

From the thread and the branch:

- what the change is meant to do: the thread itself, the PR body, the Linear issue;
- the PR, if there is one: its head, CI, approvals, and comments since the thread last looked;
- how far behind the base it is, and what landed there that touches the branch's files or what they call (`git log HEAD..origin/<base>`, with the files each commit changed).

Uncommitted work in the worktree gets committed on the branch first, as a WIP commit, so the merge can't lose it.

## 2. Merge the base in

`git fetch`, then `git merge origin/<base>`. Resolve each conflict the way both sides meant: keep the branch's change, applied to the base as it is now. Read the base's commit behind each conflict before resolving it.

Then sort the merge:

- **Simple**: only lines that were near each other, imports, lockfiles, keys added on both sides of a messages file, with every hunk keeping both sides whole.
- **Complex**: both sides changed the same logic; the base renamed, moved or reshaped something the branch uses (a function, a component, a table, a prop); the resolution needed code neither side had; or typecheck or tests broke after a clean merge (a conflict with no markers).

When the two sides want things that can't both be true (the base removed what the branch builds on, or changed a behaviour the branch relies on), that's a decision: put it on the card with how each way would go, and resolve the rest.

Done when no conflict markers are left, and every resolution can be explained by naming what each side meant.

## 3. Prove it

Hold the merged head to [ready.md](~/.agents/pr-flow/ready.md): rerun the checks the merge could affect (typecheck, lint, tests of the touched packages, i18n for messages files), fix what broke, and update the PR's checklist.

A **complex** merge also gets:

- `review-loop` in **author** mode, on the resolution: `git show --remerge-diff <merge sha>` shows what was decided beyond the automatic merge, together with the branch's whole diff against the new base;
- a diagram ([diagrams.md](~/.agents/pr-flow/diagrams.md)) when both sides reshaped the same thing: each side, then how the merge put them together, shown with the card or in the report;
- the change seen working in the running app, when it's something a student sees (ready.md, "Proof"), with screenshots updated where the screen changed.

Done when every check is green on the merged head, and for a complex merge, `review-loop` agreed, the app shows the change working, and a merge where both sides reshaped the same thing has its diagram.

## 4. Push and settle

Push to the branch. When the PR is open, `watch_pull_request` ([waiting.md](~/.agents/pr-flow/waiting.md), "Waiting on CI") and go on to step 5 without waiting. Each wake: a red check the merge caused gets fixed, proven and pushed; the checks green, unwatch; anything else is the user's, for the next skill they run.

An approved PR whose merge was complex no longer has what was approved: say so on the card, with sending it back for review (`send-for-review`) as the default.

New review comments found in step 1 aren't handled here: list them in the report, for `fix-comments`.

## 5. Ask, then report

Everything that needs the user goes on one decision card ([decision-card.md](~/.agents/pr-flow/decision-card.md)), after all the other work is done. Apply their answers, and prove again what they changed.

Report, shaped by [report.md](~/.agents/pr-flow/report.md):

- how far behind it was, and what landed on the base that mattered to it;
- simple or complex, and each conflict's resolution in a line;
- the proof: checks, `review-loop`'s verdict, the app;
- **Decided**: each call made on the user's behalf;
- the **You:** line: comments for `fix-comments`, a review to request, or nothing.

End with the Links line ([links.md](~/.agents/pr-flow/links.md)), then `In sight: <why>.` The thread stays in sight with no `t3_thread_organize` call ([waiting.md](~/.agents/pr-flow/waiting.md)): what happens next is the user's call.
