# Decision log

An **unattended run** is one the user has left: they said so ("I'm off", "overnight", "keep going without me"), or the skill says they leave (full-send, catch-up). It keeps moving instead of stopping on a question, and leaves a **trail** the user audits when back.

## Deciding alone

A call that would go on the card ([decision-card.md](decision-card.md)) is taken with its recommended option when undoing it later is cheap (a wording, a layout, a choice between two working approaches, a fix that grew a little), and logged. The run waits for the user only on what can't be undone or is said in their name: merging something not yet approved, deleting data, touching production, posting free text as them, dropping a requirement (Simplify?). Work that doesn't depend on those carries on.

## The log

`decisions.tsv` in the scratchpad, one row per decision, kept out of git:

```
ts	phase	decision	why	evidence	result
2026-11-21T02:10Z	design	empty state reuses the course screen's	the app's other screens show it that way	CourseView.tsx:88	built, screenshot shots/empty.png
2026-11-21T03:40Z	review	kept the retry at 3, not 5	the docs' default; 5 doubled the worst-case wait	docs link, test run	tests green
```

- One line per cell. **evidence** is a pointer (sha, `file:line`, a link, a screenshot path, a command's result), never prose.
- A row per fork chosen, user's call taken, pivot or revert with its trigger, blocker, and unit finished with its check. Skip the self-evident.
- Append only: a wrong row gets a new one that supersedes it.

## Before handing back

1. **Audit it** against this run's transcript: every row is a real decision with evidence that shows what it claims, and every fork that shaped the work has a row. Fix by adding rows.
2. **A second read**: an agent on the other provider (Codex when Claude ran the work, Claude when Codex did), told to read [worker.md](worker.md) first, reads the log and the transcript, and flags decisions with weak evidence, checks claimed but not run, choices that look risky now, and what a skim would miss.
3. **The report** ([report.md](report.md)) gets an **Attention** section just above the **You:** line: `reviewed by <model>`, then the user's calls taken alone (each with its pick and how to undo it), then each flag pointing at its row. "No flags" when there are none. The log's path goes on the Links line.
