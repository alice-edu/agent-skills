---
name: build-it
description: 'Take a bug or feature from wherever it starts (the user''s own words, a Linear issue, a Slack report) through to a PR that''s ready for review. Use when the user says "build it", "fix it", "pick this up" or "take this".'
---

# Build it

Takes a piece of work from wherever it stands to a PR a reviewer can approve on first read: what it really is found out first, nobody else's work redone, the cause or design thought through, proven, reviewed by Claude and Codex, with screenshots and a checklist of everything checked. It stops at an open PR, or earlier when the work turns out not to need building; posting the PR for review is `send-for-review`'s.

Shared files: [ready.md](~/.agents/pr-flow/ready.md), [pr-body.md](~/.agents/pr-flow/pr-body.md), [screenshots.md](~/.agents/pr-flow/screenshots.md), [decision-card.md](~/.agents/pr-flow/decision-card.md), [slack-report.md](~/.agents/pr-flow/slack-report.md) (only when it starts from Slack), [branches.md](~/.agents/pr-flow/branches.md).

## 1. Read where it starts

- **The user's own words**: the request as they gave it, and anything they attached.
- **A Linear issue** (`ALI-123` or its URL): its description, comments and attachments.
- **A Slack message**: slack-report.md, "Reading it".
- **A branch that already has a PR**: this run updates that PR.

Done when the problem or the feature is written in one sentence, with its evidence.

## 2. Check nobody has it

- Linear: `linear-track` step 1 as a search only, creating nothing yet, then its "taken" check on what it finds. More than one issue fits: keep going, and put the choice on the card (step 5);
- an open PR for it (`gh pr list --search`), linked to an issue or not, other than the one this run updates;
- a commit on `main` that already does it (`git log`, and the code itself);
- from Slack, slack-report.md, "Taken".

- **Taken**: stop, and tell the user who has it, its status and its PR; the thread stays in sight for their answer.
- **Already done**: go to the report with the commit or PR that did it.

Done when each check is answered.

## 3. Track it

`linear-track`: the issue step 2 found, or a new one (its step 1's last option), then its step 2, In Progress. When the issue is a choice left for the card, track it once the card is answered. From Slack, also slack-report.md, "Claiming it". On the default branch, branch first.

## 4. Find out what it is

**Fix** when something that should work doesn't; **build** when it's new or changes how something works. Write the mode and the outcome in a sentence ("Fix: an English chat's replies stop starting with a raw `<speak>` tag").

**Fix: find the cause.**

1. **Reproduce** it: a test, a script, or the running app, until it goes red the way the report says. An error alert: slack-report.md, "An error alert". When it won't go red, read the evidence and the code for a cause, and write down what was tried: a cause shown in the code is still a **Bug**; none is **Unconfirmed**.
2. **Cause**: the line or decision that makes it happen, and why it slipped through. Narrow it by elimination: list the hypotheses, then take the check that rules out the most of them first (a log read as it runs, a probe, the `why` skill for when it began), until one is left and a run shows it. A cause no run has shown is a **suspect**, written as one, never as the cause. Every line the fix ships traces to that evidence: a change that "might help" is a hypothesis and doesn't ship, and one made for a hypothesis the evidence ruled out is reverted. Search for the same cause elsewhere (other callers, the sibling component, the other language files).
3. **Scope**: when the cause makes the fix much bigger than the report suggested (a data migration, a change across packages, a behaviour change for other screens), that goes on the card with the options.

**Build: design it.**

- Read the repo's `AGENTS.md` sections for what this touches, and search for the parts that already exist (components, hooks, backend paths) before adding any.
- Design from the setup it should have, not from the earlier choices around it ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"): name each inherited constraint as a requirement or an earlier choice, and plan to clear out the earlier choices that a cleaner setup drops.
- **Research before any logic** ([lenses.md](~/.agents/pr-flow/lenses.md), "The technology's way"): for each problem other projects have solved, what solves it and what was checked; for each technology used in a new way, its docs for the installed version and how others use it. Each becomes a line of the PR body's Research section.
- **Shared code** (a component, hook or helper several places use) that's rewritten or replaced: before writing any, list what each caller relies on it for (a button kept in view, a header that stays put, the keyboard dismissing on scroll). The list goes in the behaviour table, and each item is checked again in step 7: what a rewrite loses is in the callers, never in its diff.
- For UI: what the student sees in each state (empty, loading, error, long text, dark), where it lives on screen, what it says, and how it fits what's around it, following the repo's component and state rules.
- A new screen, flow or panel, or a rework of one: run `sketch-it` here, before the card. The agreed sketch, a Doop frame of copies of the app's parts, is the design: step 6 builds it from those parts' files. A design is settled only once the user has seen it drawn and agreed; one described in prose, or called settled by the agent, isn't, so sketch-it runs. A smaller UI choice (a control, a label, where one thing sits) gets a mockup, made after a Mobbin search for how well-known apps do the same thing (sketch-it, "References"), following a convention it names. Before the user sees it, judge it by [usability](~/.agents/skills/usability/SKILL.md)'s principles and fix what fails.
- For backend work, the repo's backend review doc, the one `AGENTS.md` points to (in Alicia, `docs/backend-review.md`): design to every section of it, and write down what each new query and workflow step costs at the largest size it supports.
- **The worst case**, when the design adds or changes a workflow, a fan-out, a scheduled job, a model call or a backfill: a table, shown with the design before any code, a number in each row, from production where it can give one and labelled an estimate otherwise: the largest user it supports (the most files, the longest file, the most goals); every user, and the backfill of what exists today; model calls and dollars at that size; how long a student waits; whether one user can hold others up on a shared queue. A row that comes out bad changes the design here (generate on demand rather than ahead, batch, cap), not after review.
- **Size and prior art**, in a line each: the diff size you expect, and the existing solution looked at (lenses.md, "A solved problem"), taken or not and why.
- When the design matches [diagrams.md](~/.agents/pr-flow/diagrams.md)'s "When" (in doubt, draw it), draw it, so the user sees it before any code is written: with the card when there is one, otherwise in the report. A diagram alone asks nothing.

It ends as one verdict:

| Verdict | Means | Next |
| --- | --- | --- |
| **Bug** | reproduced, or a cause found in our code | fix it |
| **Build** | a feature the user asked to build, in their words or by naming its issue or report ("build ALI-123") | build it |
| **Small feature** | a wish the user hasn't asked to build yet (a report they said to pick up), a day's work or less | the proposed scope on the card, then build it |
| **Mitigation** | the harm is real and measured, but no run shows its cause yet (the bug didn't go red, or only a suspect is left) | the card: ship a change that softens it (a message, a retry, a count) with the cause still hunted, or keep hunting first |
| **Unconfirmed** | noise, the student's network, a one-off, or not reproducible | park it |
| **Big feature** | a wish the user hasn't asked to build yet, needing design or a product call | park it |

Then read branches.md, "The base": the base is main, and native code means a PR that waits for its store build. Native work that needs any backend change is two PRs, the backend's to main first (branches.md, "Both"): that's decided, not asked.

Done when the verdict has its evidence: a red test, numbers, a repro, the place in the app, or the design in a few lines, with its diagram when it matches diagrams.md's "When".

## 5. Ask the user

Read [decision-card.md](~/.agents/pr-flow/decision-card.md) now, whole, and ask as its "How to ask" says. The decision card, one decision per message, holding what's open:

- which Linear issue, when step 2 found several;
- the verdict, when it's anything but a **Bug** or a **Build** (a **Mitigation** always: shipping one is the user's call);
- a fix whose scope grew;
- each choice that's the user's by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides" (a UX or product choice, a Simplify? question), the recommended one first. A UX choice comes with its picture: the screen now beside a mockup of each option (decision-card.md, "a picture"), made before asking, even for a dialog nothing has drawn yet;
- **slices**, when the design spans the data model, the backend and the UI together (a native change's backend PR isn't asked: it's decided in step 4, and built first): split it into PRs that each branch from and merge to their base on their own (the schema and backend first, then the UI on top; a native slice is opened once the backend's is merged, and waits for its store build, branches.md), each its own PR and Linear issue, every one built in this run, in dependency order: a slice that needs another's code branches from that slice's branch once its PR is open, and is retargeted to the base when that merges. Building them all isn't leave to merge them;
- a council review (the `council` skill), when the user hasn't asked for one and the change reaches the data model, a workflow, auth or a migration;
- a student test (`student-test`), when they haven't asked for one and the change adds or reworks a flow a student goes through;
- for a parked report, the reply to post;
- the other problems of a bundled report.

Nothing open: no card. Everything else is decided and listed under **Decided**.

Done when the card is asked, and each question about what a student sees has its picture in the question text as `![…](/absolute/path.png)`: the screen now beside each option, a mockup where it isn't built. Options described in words only are a card not yet ready.

**Parked**: return the Linear issue to where it was, saying why (`linear-track` step 4), or for a big feature leave it in the backlog with the recommended next step. From Slack, post the reply (slack-report.md, "Parked"). Then go to the report.

## 6. Do it

**Types first** (pstack's architect), when the change adds data (a table, a field, a stored shape) or a function called across files: before any logic, write the types, signatures and where each piece lives, in two shapes, and pick the one where each piece of state has one owner, each task one way to do it, and callers need to know least. The pick and the one it beat go under **Decided** in a line each; nothing is asked. A change inside one file or one screen skips it.

Write the change the repo's way, and the right way ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"): what it adds is clean, and the debt it leans on is fixed in this PR rather than worked around (a small change whose debt fix would make it big: a thread of its own started now, [ready.md](~/.agents/pr-flow/ready.md), "A small change"). A fix: the change that removes the whole cause, its red test now green. A check where the bad state shows up is a fix only when that state is legitimate; when it shouldn't exist, the check hides the bug (pstack's fix-root-causes), and the change is a mitigation. Two fixes that leave it red share a **premise** about the cause: write it down and test it directly (a log, a probe, a script) before a third; a wrong premise sends it back to step 4's Cause. A build: what the design says, with the tests `AGENTS.md` asks for. A requirement that arrives after the design (the user's, a reviewer's, a case found while building) gets a design pass of its own before code: had it been known from the start, what shape would this have? Sketch two, pick the one where each piece of state has one owner, and rebuild to it when it isn't the current shape, rather than adding a branch for the new case. A file this change grows past easy reading gets the split considered.

## 7. Prove it

Hold it to [ready.md](~/.agents/pr-flow/ready.md): the checks CI runs, the base merged in, the change seen in the running app when a student can see it, edge cases written down. Record each result against the head. When the user asked for a student test (the `student-test` skill), run it here, once the change works in the app.

Then, once, on the whole diff against the base: `no-comments`, then `deslop`, committed on their own, so the review and the PR see the cleaned change.

## 8. Review until it would pass

The bar: a reviewer who knows the repo's docs would approve it as it stands.

A small change ([ready.md](~/.agents/pr-flow/ready.md), "A small change") skips this step: its proving run from step 7 is the review.

1. `review-loop` in **author** mode on the head, once: its budget bounds it. Its intent includes what the likely reviewer asks for: whoever reviewed these files last (`gh pr list --state merged --search <path>`), from their review comments on the repo's recent PRs.
2. Prove its fixes again on the new head (step 7): what the fixes' files reach, not the whole change again.
3. A lens that came back `not verified`: give it what it lacked (the doc, the look at the app) and recheck that lens alone.

Done when, on one final head: the loop agreed; each P2 bug is fixed or in Not fixed with the other reviewer's AGREE, and polish fixed or skipped in one line; every lens is clear or N/A, none `not verified`; both reviewers' DOCS cover the repo's docs for this change ([lenses.md](~/.agents/pr-flow/lenses.md), "The repo's docs"); and ready.md's checks pass on that head. A P1 still open when the budget is spent is Stuck: it goes on the card and blocks the merge, and the PR still opens ready for review, the open P1 first in its body.

## 9. Open the PR

Screenshots, and GIFs of what moves, per [screenshots.md](~/.agents/pr-flow/screenshots.md), made without asking; the body per [pr-body.md](~/.agents/pr-flow/pr-body.md), its checklist from step 7. A title in the style of the repo's recent PRs: what's different now, not "Fix bug". Push, open it ready for review against its base (`--base`, branches.md) (or update the existing one), and finish `linear-track`'s step 3.

Done when the PR shows the current head, its body has the T3 thread line (and Designed in Doop, after a sketch), every image loads, `screenshots-stale` says current, and every checklist item is `[x]`, `N/A` or a hand test asked of the user (ready.md, "A hand test blocks on the user").

## 10. Settle, then report

Two actions, in this order, because the report is your last message and the turn ends with it:

1. **Put the thread away.** Parked (unconfirmed, or a big feature left in Linear), or found already done: `t3_thread_organize` with `action: "settle"`. A PR opened: it isn't sent yet, so the thread stays in sight, no call.
2. **Write the report**, shaped by [report.md](~/.agents/pr-flow/report.md):

- the verdict, opening with report.md's VERIFIED / NOT VERIFIED / INCONCLUSIVE held to the outcome step 4 wrote (a Mitigation is NOT VERIFIED until its cause is fixed); its PR's title and body say `Mitigation:` and name the suspect; then the PR link with what changes for a student, a line each, or for a parked one, why and what was posted, or for one already done, the commit or PR that did it;
- the behaviour table when behaviour changed;
- **Needs you**: each hand test, asked as ready.md's "A hand test blocks on the user", and what couldn't be proven;
- **Decided**: choices made without asking;
- the **You:** line: the hand test when there is one, otherwise "say *send for review*" when there's a PR;
- the Links line ([links.md](~/.agents/pr-flow/links.md));
- last, where the thread went: `Settled.` or `In sight: <why>.`

Done when `t3_thread_organize` has answered (or the thread is in sight for a reason) and the report's last line says which ([waiting.md](~/.agents/pr-flow/waiting.md)).
