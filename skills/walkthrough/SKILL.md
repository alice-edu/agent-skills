---
name: walkthrough
description: 'Walk the user through a PR so they can review it themselves: a page with what changed, real screenshots, diagrams, the reading order and every decision with who made it; what''s over-built, hacky or the wrong tool; each hard-to-undo agent decision challenged blind; the agents'' work audited; one card. Use when the user says "human review" or "walk me through" a PR, theirs or a teammate''s.'
---

# Walkthrough

The user reviews a PR themselves, without reading the diff first: a **page** that shows what the PR does, how, and every decision in it with who made it, then what a fresh look finds wrong with those decisions. Agents wrote most of the PR, so the page is built to catch what agents get wrong: decisions made without the user, designs **over-built** for what they do, **hacky** ways around a problem, the **wrong tool** for a job, and evidence that proves less than it claims.

It explains first and judges second, and judges with agents that don't see the PR's own justification, so they can't just agree with it. It posts and changes nothing until the user answers its card.

Shared files: [lenses.md](~/.agents/pr-flow/lenses.md), [screenshots.md](~/.agents/pr-flow/screenshots.md), [diagrams.md](~/.agents/pr-flow/diagrams.md), [decision-card.md](~/.agents/pr-flow/decision-card.md), [report.md](~/.agents/pr-flow/report.md), [links.md](~/.agents/pr-flow/links.md).

## 1. Gather

- The PR: number, **head** SHA, base, author, diff (`gh pr view`, `gh pr diff`), its body, commits, review comments, checks.
- **Its build thread**: `t3_thread_search` by PR number and branch, and on a teammate's PR the `T3 thread:` link in its Slack thread, read in that thread's environment (`t3_environment_links` lists the linked ones; pass its `environmentId`). Found, then `t3_thread_read` it: every message (`view: "messages"`, paged to the end), and the activity around each card, each report's **Decided** list and each review ledger (`view: "activity"` from just before that point): the user's words, every card and its answer, the agents' reasoning where they chose, findings declined.
- Its Linear issue and Slack thread, for what was asked.
- No build thread to read (on a machine that isn't linked, or gone): the PR body, commits, review comments and Slack thread are the sources, and every decision from them is **reconstructed** (step 2).

On a teammate's PR, **the owner** below is its author, not the user: the decisions "made by the owner" are the author's, on a card or in a message.

Done when the head SHA, what the PR set out to do (in the asker's words), and the list of sources read are written down.

## 2. Decisions

Walk the diff in **layers**, foundations first, the order you'd explain it in: schema and data, backend, the UI, tests. A layer is what belongs together (a contract, its code and its tests), not a folder. For each layer, every choice that could have gone another way and matters is a **decision** row:

- **Chosen**, and **over what** (the alternative named where it was weighed; otherwise the obvious one);
- **Why**, as given where it was made;
- **Who decided**: *the owner on a card*, *the owner in a message*, *the agents*, or *reconstructed* (no source shows it being made: summaries written after the fact tidy and invent, so a reconstructed row is a guess and says so);
- **Source**: the thread message or card answer where it was made, or the commit;
- **Lines**: the file:line ranges that carry it (the limit, the check, the rule), so the user reads those closely and skims the rest;
- **Hard to undo**: yes when it sets the data model or a migration, what a student sees or does, a new outside package or service, or something other parts will build on.

Scope is a decision too: what the diff does beyond what was asked is a row of its own.

Done when every hunk of the diff is in a layer, and every hunk that could have been done another way that matters has its row with a source or the word reconstructed.

## 3. Judge, all at once

Start these together; each is a fresh agent that hasn't seen this thread, given the repo, the head, and what it needs below. The skeptic and the challengers are **blind**: never the PR body's reasons, the build thread or the decision table, since an agent handed the answer tends to return it agreed. Commit messages carry the reasons too, so a blind agent works in a copy without history (`git archive <sha> | tar -x -C <dir>`), not a checkout. What the owner decided is no reason but a requirement, so it goes to them as one. Use the other provider for the skeptic and the challengers (Codex when you are Claude), through the harness's delegation (`delegate_task` in T3 Code).

- **The skeptic**: the whole diff against three questions, each finding with file:line and evidence:
  - **Over-built**: more than the requirement needs (lenses.md, "The simplest shape"). Name the simpler version, what it gives up, what it saves.
  - **Hacky**: getting around a problem instead of through it (lenses.md, "The right way"): a timeout or retry hiding a race, a cast or disable silencing a check, matching on error text, a special case at the symptom, logic copied instead of shared, a test bent to pass.
  - **Wrong tool**: a hand-rolled solved problem, a technology used against its docs, or a part the repo already has done again (lenses.md, "A solved problem", "The technology's way"). Name the right one, with its doc page.
- **Challengers**: one for each area of hard-to-undo decisions **the agents** made (step 2), however many that is. An area is one mechanism: decisions that belong together (a schema, its index and its backfill) go to one challenger, and a small feature is often one area. Each gets the problem in the asker's words, the repo's docs that bind it, and the code at the PR's **base**, not its diff, and designs that area itself, as small as it can be while meeting every requirement: what it would build, what it would reject, and why. Decisions the owner made aren't challenged; easy-to-undo ones aren't either. When step 2 found many hard-to-undo agent decisions, that's a finding of its own: the PR should have been sliced, or those decisions were the owner's (decision-card.md, "Who decides").
- **The audit**, of the agents' work rather than the code. It isn't blind: it gets the decision table, each report's **Decided** list, the card answers and the findings the build declined.
  - each behaviour the PR says it tests is really tested: in a scratch worktree at the head, break that behaviour alone (a condition flipped, a call removed) and run the tests; one should go red. Reverting the whole change doesn't work when the tests import what the PR adds;
  - the diff stays inside what was asked;
  - each ticked checklist item has evidence at this head, not an earlier one;
  - each screenshot in the body matches the head (retake the one most likely to have drifted);
  - no decision that was the owner's (decision-card.md, "Who decides") was made without a card;
  - no review finding was waved away without a reason.
- **The code review**: `review-loop` in **reviewer** mode, editing nothing, on the PR's whole diff, with your own seat in it taken by a fresh Claude agent (or Codex, when you are Codex), since you've read the reasons. An earlier ledger (the PR body's "review-loop agreed at", or the user's own review of a teammate's PR) is reused for what hasn't changed since its commit: the loop then reviews only the diff from that commit to the head. When the user says "council", run it as a council. Findings it shares with the skeptic or the audit are merged into one row.

When a challenger's answers are in, a **comparer** (a fresh agent, on a model neither the builder nor that challenger ran on where the harness offers one) gets each area's decisions with their reasons beside the challenger's design and gives one verdict an area: **same**, **ours better** (why), or **theirs better** (what changes, and what it costs to change now).

Done when every agent has answered, every skeptic finding is checked against the code by you (a finding you can't confirm is marked so, not dropped), and every challenged area has its verdict.

## 4. The page

Make it while step 3 runs, and add the judging when it lands.

- **Screens**: real screenshots from the running app at the head, before (base) and after, for every state the PR touches, as [screenshots.md](~/.agents/pr-flow/screenshots.md) "Capture" says. The PR body's own screenshots count when the head differs from where they were taken only by a merge of the base that touched none of the PR's files. A PR no student sees has none.
- **Diagrams**: one of how the change works end to end, and one for each decision or finding that matches [diagrams.md](~/.agents/pr-flow/diagrams.md) "When", each option's way for a "theirs better" verdict. They're drawn in the page itself (Mermaid), since the page is private: an Excalidraw scene's public link would share what the PR keeps private. For a card question, the same Mermaid rendered alone in headless Chrome and saved as a PNG is its picture.
- **Publish** it as a private Artifact: the Artifact tool's quickstart gives the design guidance (load `artifact-design` only without one); images as the page's files. Without an Artifact tool, an HTML file shown with `html_preview` and `html_render`.

It opens with a header: the PR, the head it covers, and one line counting the decisions, how many the owner made, how many were challenged, and the findings. Then, in this order, in plain words, parts named as they look on screen:

1. **What changed for a student** (or a teammate), in three sentences.
2. **Screens**, before and after.
3. **How it works**: the diagram, then the layers in reading order, each with a line and links to its lines.
4. **Decisions**: the table from step 2, with the comparer's verdict on each challenged row and why each unchallenged row wasn't. Agent-made, hard-to-undo rows stand out.
5. **Simpler, sounder, better suited**: the skeptic's over-built, hacky and wrong-tool findings, each with the simpler or right way.
6. **The agents' work**: the audit, each check passed or failed with its evidence.
7. **Code review**: the ledger's open findings.
8. **Risks and not tested**: where it would fail first, and what nobody proved.
9. **What's on the card.**

Done when every section is filled or says "none", every row has its source, and you've opened the page and looked at it.

## 5. Ask once

One decision card ([decision-card.md](~/.agents/pr-flow/decision-card.md)): each "theirs better" verdict, each confirmed skeptic finding worth changing, each failed audit check, each open P1 from the review, and each decision that should have been the user's. Every question carries its picture or diagram as the card says, the recommended option first. A user's call that changes little (a placeholder's wording, a small fix's side effect) goes in one line at the card's end, "Kept as built unless you say: …", rather than a question of its own. The agents' calls the comparer, skeptic or audit settled are listed under "Done on go" and need no question.

What "go" does depends on whose PR it is:

- **The user's**: make the changes chosen as `fix-comments` makes a fix (its ✅ Fix rows: fix, prove, `review-loop` in author mode on the result), push, and update the PR body.
- **A teammate's**: the chosen rows become a review posted as `review-pr` step 5 posts one: changes requested when a row is blocking, otherwise a comment review, which leaves an approval the user already gave standing.

Nothing on the card: no question.

## 6. Report

As [report.md](~/.agents/pr-flow/report.md): the verdict line first, the page's link, what was changed or posted after the card, then the **You:** line and the Links line ([links.md](~/.agents/pr-flow/links.md)). The thread stays in sight while the card is open; afterwards `In sight: <why>.` or nothing to wait on.
