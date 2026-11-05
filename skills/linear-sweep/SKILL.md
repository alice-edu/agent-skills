---
name: linear-sweep
description: Audit the user's Linear board against GitHub and fix what drifted. Use when they ask to sync, clean up, or check Linear for stale or out-of-sync issues.
---

# Linear sweep

Find every issue whose status disagrees with its PR, every stale issue, and every PR with no issue. Report first; change Linear only after the user approves.

Read the board table and the status meanings in [`linear-track`](../linear-track/SKILL.md). Sweep the project for the current repo, or every row when the user asks for all of them.

## 1. Gather

- Every issue in the project that is not Done, Canceled or Duplicate, with assignee, status, last update, parent and attachments.
- The state of each attached GitHub PR (open, draft, merged, closed).
- The user's own PRs in the repo from the last 30 days, open and merged (`gh pr list --author @me --state all`).

Done when every open issue and every one of those PRs is in hand.

## 2. Classify

Put each issue or PR in every class it fits:

| Class | Test | Proposed fix |
| --- | --- | --- |
| Behind its PR | PR merged, issue before Implemented | Implemented |
| Ahead of its PR | In Review or later, every PR closed unmerged or none attached | In Progress, or ask |
| Stale | In Progress, no open PR, untouched for 7 days | Backlog, or ask |
| Unowned | Started, no assignee | Assign to the PR's author, or ask |
| Untracked PR | The user's PR with no `ALI-` identifier and no issue attaching it | Attach to a matching issue, or create one in the PR's current status |
| Waiting on the user | Implemented for 7 days | List only: Done is their call |
| Parent lag | Every sub-issue Implemented or Done, parent still earlier | List only |

Done when every gathered issue and PR is classified or named as in sync.

## 3. Report

One table: issue or PR, title, owner, what is wrong, proposed fix. The user's own issues first, then other people's. End with the count in sync.

## 4. Apply

Wait for the user to approve, in whole or by row. Apply approved fixes to their own issues and to unassigned ones. For an issue assigned to someone else, change it only when they approve that row by name. Add no comment for a status correction; comment one sentence when moving a stale issue back.

Done when each approved row is re-read from Linear and shows the new value.
