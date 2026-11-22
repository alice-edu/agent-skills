---
name: no-comments
description: 'Delete the comments in a change that restate the code, and turn each one that guards a real constraint into a type, check or test instead. Use when the user says "no comments" or "comment sicko", on a diff, a PR or files.'
---

# No comments

A comment that says what the code does goes stale and gets copied. A comment that explains a surprise in our own code means the code should be reshaped until it isn't a surprise. A constraint ("do not remove", "keep this wording") holds only while someone reads it, so it becomes a check. What's left is what the code can't say: why an outside thing we can't change forces it.

Adapted from poteto's [pstack](https://github.com/cursor/plugins/tree/main/pstack) (MIT).

**Scope**: the files or diff the user names; otherwise the branch's diff against its base, the working tree included. Only comments inside it.

## 1. The sweep

Start one subagent with [sicko.md](sicko.md) as its brief, plus the scope and the repo's `AGENTS.md`. It deletes comments and reports; it never edits code.

## 2. Check its work

Read its diff and report. Reject:

- an edit to anything but a comment;
- a deletion outside the scope;
- a deleted comment one of its keeps covers (sicko.md, "What stays"), restored as it was;
- a `MUST KILL` whose reason is wrong.

A keep stands only with proof that it's about something we can't change. Before accepting a kill or keep of an "IMPORTANT" or "do not remove", trace the symbol it names, or run `why` on it. A kill that's still unclear stays killed; a keep that's refuted or unclear goes. When you reject its report, revert it and rerun it once with the failure named.

## 3. Fix what the comments hid

Each `MUST KILL` names code whose surprise the comment explained. Fix the easy ones directly: delete the dead path, drop the unused parameter, call the real API, rename so the name says it. One that needs a new shape (a type, a split, a state machine) is a design: sketch it, and do it in this change only when it stays inside the scope. Otherwise it goes in the report as open. Never a guard that hides the symptom.

## 4. Encode the constraints

A comment that says "do not remove", "do not change the wording" or "ask X before changing" is a constraint. Offer the cheapest way to enforce it inside the scope: a type, a runtime check, a test, a lint. The user says which; in an unattended run, take the test and log it. Once it's encoded, delete the comment. When none fits, delete the comment and report the constraint as unenforced.

## 5. Prove it

Run the checks the change touches (typecheck, lint, tests): a deleted comment can be one lint requires.

**Reply** per [report.md](~/.agents/pr-flow/report.md): what changes for the user (the comments gone, the code reshaped, the constraints now enforced), then Needs you for each encoding to choose and each unenforced constraint. The counts and the sweep's report go in the PR body.
