---
name: build-it
description: 'Take a bug or feature from wherever it starts (the user''s own words, a Linear issue, a Slack report) through to a PR that''s ready for review. Use when the user says "build it", "fix it", "pick this up" or "take this".'
---

# Build it

Takes a piece of work from wherever it stands to a PR a reviewer can approve on first read: what it really is found out first, nobody else's work redone, the cause or design thought through, proven, reviewed by Claude and Codex, with screenshots and a checklist of everything checked. It stops at an open PR, or earlier when the work turns out not to need building; posting the PR for review is `send-for-review`'s.

Shared files: [ready.md](~/.agents/pr-flow/ready.md), [pr-body.md](~/.agents/pr-flow/pr-body.md), [screenshots.md](~/.agents/pr-flow/screenshots.md), [decision-card.md](~/.agents/pr-flow/decision-card.md), [slack-report.md](~/.agents/pr-flow/slack-report.md) (only when it starts from Slack).

## 1. Read where it starts

- **The user's own words**: the request as they gave it, and anything they attached.
- **A Linear issue** (`ALI-123` or its URL): its description, comments and attachments.
- **A Slack message**: slack-report.md, "Reading it".
- **A branch that already has a PR**: this run updates that PR.

Done when the problem or the feature is written in one sentence, with its evidence.

## 2. Check nobody has it

- Linear: `linear-track` step 1 as a search only, creating nothing yet, then its "taken" check on what it finds. More than one issue fits: keep going, and put the choice on the card (step 5);
- an open PR for it (`gh pr list --search`), linked to an issue or not, other than the one this run updates;
- a commit on `main` that already does it (`git log` on main, and the code itself);
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
2. **Cause**: the line or decision that makes it happen, and why it slipped through. Search for the same cause elsewhere (other callers, the sibling component, the other language files).
3. **Scope**: when the cause makes the fix much bigger than the report suggested (a data migration, a change across packages, a behaviour change for other screens), that goes on the card with the options.

**Build: design it.**

- Read the repo's `AGENTS.md` sections for what this touches, and search for the parts that already exist (components, hooks, backend paths) before adding any.
- Design from the setup it should have, not from the earlier choices around it ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"): name each inherited constraint as a requirement or an earlier choice, and plan to clear out the earlier choices that a cleaner setup drops.
- For each outside package or service it uses in a new way, read the docs for the installed version, and note which.
- For UI: what the student sees in each state (empty, loading, error, long text, dark), where it lives on screen, what it says, and how it fits what's around it, following the repo's component and state rules.
- For backend work, the repo's backend review doc, the one `AGENTS.md` points to (in Alicia, `docs/backend-review.md`): design to every section of it, and write down what each new query and workflow step costs at the largest size it supports.
- When the design is hard to follow in prose, draw it per [diagrams.md](~/.agents/pr-flow/diagrams.md), so the user sees it before any code is written: with the card when there is one, otherwise in the report. A diagram alone asks nothing.

It ends as one verdict:

| Verdict | Means | Next |
| --- | --- | --- |
| **Bug** | reproduced, or a cause found in our code | fix it |
| **Build** | a feature the user asked to build, in their words or by naming its issue or report ("build ALI-123") | build it |
| **Small feature** | a wish the user hasn't asked to build yet (a report they said to pick up), a day's work or less | the proposed scope on the card, then build it |
| **Unconfirmed** | noise, the student's network, a one-off, or not reproducible | park it |
| **Big feature** | a wish the user hasn't asked to build yet, needing design or a product call | park it |

Done when the verdict has its evidence: a red test, numbers, a repro, the place in the app, or the design in a few lines.

## 5. Ask the user, once

One decision card holding what's open:

- which Linear issue, when step 2 found several;
- the verdict, when it's anything but a **Bug** or a **Build**;
- a fix whose scope grew;
- each choice that's the user's by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides" (a UX or product choice, a Simplify? question), the recommended one first;
- a council review (the `council` skill), when the user hasn't asked for one and the change reaches the data model, a workflow, auth or a migration;
- a student test (`student-test`), when they haven't asked for one and the change adds or reworks a flow a student goes through;
- for a parked report, the reply to post;
- the other problems of a bundled report.

Nothing open: no card. Everything else is decided and listed under **Decided**.

**Parked**: return the Linear issue to where it was, saying why (`linear-track` step 4), or for a big feature leave it in the backlog with the recommended next step. From Slack, post the reply (slack-report.md, "Parked"). Then go to the report.

## 6. Do it

Write the change the repo's way, and the right way ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"): what it adds is clean, and the debt it leans on is fixed in this PR rather than worked around. A fix: the change that removes the whole cause, its red test now green. A build: what the design says, with the tests `AGENTS.md` asks for. A file this change grows past easy reading gets the split considered.

## 7. Prove it

Hold it to [ready.md](~/.agents/pr-flow/ready.md): the checks CI runs, the base merged in, the change seen in the running app when a student can see it, edge cases written down. Record each result against the head. When the user asked for a student test (the `student-test` skill), run it here, once the change works in the app.

## 8. Review until it would pass

The bar: a reviewer who knows the repo's docs would approve it as it stands. Loop until it's met:

1. `review-loop` in **author** mode on the head. Its intent includes what the likely reviewer asks for: whoever reviewed these files last (`gh pr list --state merged --search <path>`), from their review comments on the repo's recent PRs.
2. Prove its fixes again on the new head (step 7).
3. Code changed since the loop last looked, or a lens came back `not verified`: go again.

Done when, on one final head: the loop agrees with no open P1; each P2 is fixed, or skipped as optional in one line; every lens is clear or N/A, none `not verified`; both reviewers' DOCS cover the repo's docs for this change ([lenses.md](~/.agents/pr-flow/lenses.md), "The repo's docs"); and ready.md's checks pass on that head. A P1 still open when the budget is spent is Stuck: it goes on the card, and the PR opens as a draft until it's settled.

## 9. Open the PR

Screenshots per [screenshots.md](~/.agents/pr-flow/screenshots.md); the body per [pr-body.md](~/.agents/pr-flow/pr-body.md), its checklist from step 7. A title in the style of the repo's recent PRs: what's different now, not "Fix bug". Push, open it ready for review (or update the existing one), and finish `linear-track`'s step 3.

Done when the PR shows the current head, every image loads, and every checklist item is `[x]`, `N/A` or Test by hand.

## 10. Report

Shaped by [report.md](~/.agents/pr-flow/report.md):

- the verdict, and the PR link with two or three lines on what changed, or for a parked one, why and what was posted, or for one already done, the commit or PR that did it;
- the behaviour table when behaviour changed;
- Test by hand, and anything that couldn't be proven;
- **Decided**: choices made without asking;
- the **You:** line: "say *send for review*" when there's a PR;
- the Links line ([links.md](~/.agents/pr-flow/links.md)).

Then put the thread where [waiting.md](~/.agents/pr-flow/waiting.md) says.
