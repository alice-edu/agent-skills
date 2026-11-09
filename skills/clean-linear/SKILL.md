---
name: clean-linear
description: Clean up the Linear board's waiting issues (Triage, Backlog, Needs Shaping, Ready to Build): sort each into the status whose bar it meets, cancel what won't be done, and fix what's thin, with the user deciding in quick batches. Use when the user says "clean Linear", or "triage" for the inbox alone.
---

# Clean Linear

Every issue waiting to be built sits where it belongs, by the bars in [`linear-track`](~/.agents/skills/linear-track/SKILL.md) ("The board"): Triage empty, Ready to Build truly ready, Needs Shaping saying what's open, Backlog holding only what someone might still want, the rest canceled with a reason. Moving issues is the user's call (what gets built is the product); finding the facts behind each move is yours.

## 1. Gather

The board's team and project from `linear-track`. "triage": the issues in Triage. "clean Linear": Triage, Backlog, Needs Shaping and Ready to Build. For each: title, description, comments, creator, assignee, priority, created and last updated, parent, attachments, and Linear's duplicate suggestions (`triageIntel`).

Done when every issue in scope is in hand, every page read.

## 2. Find the facts

For each issue, what an agent can settle without the user:

- **Already done**: the code on the default branch does it now, or a merged PR fixed it (search the repo's PRs and `git log` for its identifier and its words). Name the PR or the file and line.
- **Duplicate**: the same problem as another open issue. Name the one that keeps it: the clearer, or the older when equal.
- **Out of date**: about a screen, feature or service that's gone or changed past it.
- **Thin**: what it lacks for Ready to Build's bar.
- **Open**: the product question it hangs on, if any.

Over about 30 issues, split this across subagents where the harness has them, a batch each, each returning one line of facts per issue with its evidence.

Done when every issue has its line of facts, or "nothing found".

## 3. Recommend

One status per issue, with a reason in a few words:

- **Cancel**, already done (with the PR), duplicate (of which), or out of date: these first, they're the easy ones.
- **Ready to Build**, when it meets the bar or can be brought to it from facts alone.
- **Needs Shaping**, with its open question.
- **Backlog**, wanted some day but not soon.
- **Cancel**, not worth doing: the recommendation is the agent's guess, so say why in a line ("untouched since August, its screen was redesigned since").

Then group them by area of the app (the chat, sources, practice, exams, billing…), not by status: issues side by side in one area make duplicates and priorities plain.

Done when every issue has a recommendation and a group.

## 4. Ask in batches

One batch of 10 to 15 issues at a time, the easy cancels first, then by group. Each batch is a numbered table in chat:

| # | Issue | Now | What it is, in a line | Move to | Why |
| - | ----- | --- | --------------------- | ------- | --- |

Titles are linked to the issue. Then ask with the harness's question tool: "Apply batch 2 as recommended?", answered "yes", or with the exceptions ("yes, except 4: backlog, 7: keep"). An issue the user wants to talk about is set aside and comes back after the batches.

Done with a batch when it has an answer for every row.

## 5. Apply

After each batch, at once, so a stop midway loses nothing:

- **Cancel**: a comment with the reason in one sentence, then Canceled; a duplicate is marked as a duplicate of the one that keeps it (`duplicateOf`), so its attachments move over.
- **Ready to Build**: bring the description to the bar: keep what the reporter wrote, and add what's missing (cause, constraints, done when) from the facts. Describe the problem, not the design: a product call it still needs means it isn't ready.
- **Needs Shaping**: add the **To shape** section with the open question and what settles it.
- **Backlog**: the status alone.

Someone else's issue gets a one-line comment on any move, so they hear why.

Done when Linear shows every answered row as answered.

## 6. Rank and report

Propose the order of Ready to Build's top five, by what each unblocks and how many students it touches, and set priorities on the user's answer.

Then report: each status's count before and after, what was canceled and why (grouped by reason), what's in Needs Shaping waiting on the user, and the issues set aside.

Done when the report is sent.
