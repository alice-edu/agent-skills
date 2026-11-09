---
name: linear-track
description: Track a thread's work on the user's Linear board. Use when a thread starts work that will end in a PR, and again when that PR is opened.
---

# Linear track

Every PR the user ships has one Linear issue, and the issue's status says where the work is. Questions, research and reviews of someone else's PR get no issue.

## The board

| Repo | Team | Project |
| --- | --- | --- |
| `alice-edu/alicia` | `ALI` | Alicia |

In a repo without a row, track only when the user names the issue; ask them for the team and project before creating one, then add the row.

Before work starts, an issue waits in one of four statuses. Each has a bar, and an issue that doesn't meet it moves (`clean-linear` keeps them honest):

- **Triage**: the inbox. Every issue leaves it, for one of the three below, Canceled or Duplicate.
- **Ready to Build**: an agent could build it without asking anything: the problem, its evidence or cause, the constraints and what done means, with no product call left open. It describes the problem, never the design. Ordered by priority, so its top is what's next.
- **Needs Shaping**: needed, but something is open. Its description ends with a **To shape** section: the open question, and what settles it (the user, a student, a sketch, a whiteboard session).
- **Backlog**: maybe some day; nothing in it is promised. Canceling is normal too, with the reason in a comment, and a canceled issue can be reopened.

Once work starts, in the order it moves:

- **In Progress**: set by this skill when work starts. Linear's GitHub integration keeps it there while a linked PR is open, and resets In Review to it when a PR is linked.
- **In Review**: set by `send-for-review` when the PR is posted for review, or by the user.
- **Implemented**: set by the integration when the PR merges.
- **Done**: The user's call, by hand.

Top-level issues in the project are the current priorities, each with an owner. Smaller work that serves one of them is its sub-issue.

## Steps

### 1. Find the issue

Take the first that yields exactly one issue:

1. An `ALI-123` identifier or Linear URL in the prompt, the branch name, or the thread's PR.
2. A search of the project's open issues for the work described. Ask the user when more than one fits.
3. A new issue: team and project from the table, a title in the style of the board's recent issues, a description of one or two sentences from the request, and the matching priority as parent when one clearly fits.

Done when one issue identifier is named in your reply to the user.

### 2. Start it

First check whether someone else has it. The issue is **taken** when it is assigned to another person and already started, or when it has an open PR by another author (read its attachments, and search the repo's open PRs for its identifier). On a taken issue, stop before editing code: tell the user who has it, its status and the PR, and wait for their answer.

Otherwise set the issue to In Progress. Assign it to the user when it has no assignee. When it is assigned to someone else but not started, leave the assignee and tell the user whose it is.

Done when the issue reads In Progress, or the user has answered on a taken one.

### 3. Link the PR

When opening the PR, end its body with `Fixes ALI-123`, or `Part of ALI-123` when the PR leaves the issue unfinished. The integration then owns the status: In Progress while the PR is open, Implemented when it merges.

After the PR exists, read the issue back. Done when it lists the PR as an attachment. If the link is missing, add the PR URL to the issue.

### 4. If the work is dropped

Return the issue to the status it had before step 2, and comment one sentence on why. Cancel an issue this skill created.
