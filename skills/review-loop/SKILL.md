---
name: review-loop
description: 'Review a change with Claude and Codex in rounds until both agree. Use when the user says "review loop", and from build-it, fix-comments, full-send and review-pr.'
---

# Review loop

Two independent reviews of one change: yours, and a fresh reviewer on the other provider (Codex when you are Claude, Claude when you are Codex). You merge them into one **ledger**, act on it, and go again until both have no open P1 on the current head. Both look through the same **lenses** ([lenses.md](~/.agents/pr-flow/lenses.md)): Spec, Correctness, Standards, and Backend or UI and UX where the change reaches them.

It runs in one of two modes, named by the caller (or, from the user, "author" when the change is ours):

- **author**: the change is the user's. You fix what's real and the loop re-checks the fixes.
- **reviewer**: the change is someone else's. You edit nothing; the ledger is the result.

Either mode can run as a **council** when the caller or the user asks for it (the `council` skill): round 1 has four reviewers instead of two (see "Council").

## Severity

- **P1**: the intended case is wrong, a bug callers will hit, a security hole, data loss, or a broken deploy. Every P1 carries **evidence**: the code path that reaches it, a reproduction, a failing test, or a doc quote. A P1 without evidence is a P2 until it has some. From round 2, a new P1 in code the fixes didn't touch needs a **run** as its evidence: a failing test, a repro, or command output (a probe script where a race or data loss is hard to reproduce); an argument alone makes it a P2.
- **Housekeeping**: what lenses.md asks of the PR around the code: leftovers, Test by hand lines, screenshots, the PR body, a missing story. In author mode you fix it directly and list it in the ledger; it is done before the PR is ready, and never starts a round by itself.
- **P2**: everything else: another path, a rare case, small performance, naming, style, a refactor. Optional.
- **The user's call**: a finding that's theirs by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides" (the product, or a Simplify? question), whatever its severity. It goes on the caller's decision card, with the answer the reviewers agree on as the default. Every technical finding is settled here by the docs, in both modes.

Re-grade every finding yourself, whatever label it came with. A **rare** case, one an honest user reaches only through an unusual sequence of steps, is P2 even from a confident reviewer, and so is a speculative one. Never rare: input at the sizes the repo supports (the largest course, the most files) and anything an attacker controls. Harm a reload can't undo (another student's data, lost work, money, a broken deploy) keeps a finding P1 however rare, as does what the repo calls blocking (lenses.md, "Every finding").

## Budget

Every round finds about one new P1 whatever its number, so more rounds never converge by themselves: the budget is what ends the loop.

- A diff of under ~100 changed lines: one round.
- Otherwise up to 2 rounds; 3 while a P1 proven by a run stays open in auth, permissions, data loss, money or concurrency.
- After the last round, when it had a P1 you fixed: one **fix check** by the other reviewer, on the open ids and the fix's diff through its callers only. It raises nothing new beyond a regression from the fix.
- The user's "another round" grants one more.
- The budget is per run. A later run on the same PR (fix-comments, catch-up, a merge of the base) reviews only what changed since the PR's agreed head (step 1), so it never starts over.

## Council

Four seats, one from each model line: Codex's **Sol** and **Astra**, Claude's **Opus** and **Fable**, each the newest of its line, at high effort. In T3 Code, read the ids from `orchestrator_capabilities`. Outside it, a seat whose model id can't be named for certain from the CLI's own model list is unavailable. You hold a seat only when your own model and effort match it; otherwise you coordinate and all four are delegated. A line that isn't listed, or a seat that errors, is named in the report. A council with fewer than three seats, or with only one provider left, is a normal review, and the report says so.

- **Round 1**: every seat gets the same brief (step 2) at the same time, and you write your own review before reading any of theirs (step 3).
- **Wait for all of them**: merge, edit and judge agreement only once every seat has replied or clearly failed. A seat still out 15 minutes after the others replied is named late in the report, and the merge goes on without it while three seats remain.
- **Merge** (step 4): each ledger row also records which seats raised it. A P1 from one seat only is checked against the code by you before it counts. One raised by two seats or more is more likely real, but still needs its evidence.
- **Round 2 on**: only you and the other provider's newest seat (Sol when you are Claude, Opus when you are Codex), as in a normal loop, so it can still finish. A seat whose P1 is still disputed gets the dispute in a reply of its own once. After that, the dispute goes to the caller's card (step 7).
- **Budget**: the same as a normal loop, counting round 1 as one round.

The report names every seat with its model and effort, and for each P1, the seats that raised it.

## Steps

### 1. Scope

Find the base (`git merge-base HEAD origin/<base branch>`, or the PR's `baseRefName`) and the head SHA. Write the **intent** in one or two sentences (from the PR, the Linear issue, or the user), quoting its source, and what is out of scope. Pick the lenses that apply (lenses.md). Note the checks already run on this head and their results, and in author mode the draft Test by hand lines (ready.md).

In author mode, commit first, so the head names exactly what is reviewed; review a clean tree only.

**The agreed head.** When the PR was already agreed (its body's `Agreed at <sha>`, or this thread's ledger), with the same mode, lenses and seats (a council asked for after a two-reviewer loop isn't one), compare the change itself: `git diff <base>...<sha> | git patch-id --verbatim` against the same for the head (verbatim: a whitespace change can change behaviour). The same patch id (a merge of the base alone) means the review is done: return the ledger; the checks and proof are still rerun on the new head (ready.md). Otherwise review the **delta**: the diff since the agreed head, through its callers, with the ledger carried over and its open ids. A full review again only on the user's word, or when the design changed (a rewrite).

Done when base, head, intent and the checks are written down.

### 2. Start the other reviewer

(A council's round 1 starts the three other seats here, in parallel, each with its own `clientRequestId`. Outside T3, a seat on your own provider is `claude -p --model <id> --permission-mode plan` or `codex exec -m <id> -s read-only`.)

- **In T3 Code**: `orchestrator_capabilities` once, then `delegate_task` with `role: "review"`, `mode: "async"` and a new `clientRequestId` each round, on the other provider's newest model at high effort (Codex: the newest GPT, the `sol` line when listed; Claude: the newest Opus). Name the model and effort in the report.
- **Outside T3**: from Claude, `codex exec -s read-only "<brief>"` in the repo; from Codex, `claude -p --permission-mode plan "<brief>"` in the repo (plan mode reads but never edits).
- No route to the other provider: say so and stop. A second review on the same model is no substitute.

Brief, the same every round:

```
Review only. Edit nothing, post nothing, start no subagents. Read ~/.agents/pr-flow/worker.md first.
Repo: <abs path>  Base: <sha>  Head: <sha>
Intent: <intent> (source: <issue/PR/words>)  Out of scope: <scope>  Checks: <results>
Test by hand (author mode): <draft lines, or none>
Diff: git diff <base>..<head> (plus `git status --short` for uncommitted files)
Read the surrounding code and callers. Review through these lenses: <lenses>, as
~/.agents/pr-flow/lenses.md describes (read it, then the repo's docs as its "The repo's docs"
says: every one that bears on the change, in full).
P1 = intended case wrong / bug callers hit / security / data loss / broken deploy / what the
repo calls blocking, each with evidence (code path, repro, failing test, doc). P2 = everything
else, optional.
Reply:
VERDICT: APPROVE or CHANGES
DOCS: <each repo doc read, by path>
LENSES: <lens>: clear | findings <ids> | N/A | not verified: <why>, one per lens
<id> [P1|P2] [agents|user] [<lens>] <file>:<line> <claim>. Source: <...>. Evidence: <...>. Fix: <...>
```

From round 2, add the ledger (`fixed in <sha>` / `disagree: <evidence>` / `declined: <why>`), the diff since the last round, and: "Check the open ids and the changed code, through its callers; mark each old id resolved or still open. Reopen a settled id only with new evidence. A new id only for a regression from the fixes, or with a run as its evidence. Classes found so far: <classes>."

### 3. Your own review

While the other reviewer runs, review the same diff yourself, before reading its reply, so the two stay independent. Read the changed code's callers, and apply each chosen lens as lenses.md says, with the repo docs it names and the current docs of each technology it uses (lenses.md, "The technology's way"). In author mode, edit nothing until its reply is in: it is reviewing this head.

Done when every changed file has been read in full with its callers, and every doc in the repo's docs for this change (lenses.md) has been read.

### 4. Merge

Put both reviews in the ledger: one row a finding, duplicates merged, each with id, severity (re-graded), owner (decision-card.md, "Who decides"), lens, **class** (the way the bug gets through: "an image URL gets past the Mermaid text filter"), file:line, claim, source, evidence, and who raised it. Check each against the code yourself; a finding you can't confirm is marked unconfirmed, not dropped. Compare each reviewer's DOCS with your own list: a doc it missed makes the lenses that doc bears on `not verified` for it, and the next round's brief names the doc.

### 5. Act

**Author mode**: a user-owned finding waits for the card; the rest are yours. Fix each P1 completely, the whole cause rather than the one symptom ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"), plus a test that fails without it when the repo has a place for one. Fix housekeeping directly. Take each P2 that matters for what the change touches, cheap or not. One that doesn't really matter is optional: skip it in one line, as optional rather than a follow-up. Where you disagree, write why with evidence. Then rerun the checks the fixes touch, and compare `git diff --shortstat <base>` with before: growth from doing the change right stays; cut back only what reaches past what the change touches.

**Reviewer mode**: edit nothing. The ledger, with the user's-call items separated out, is the result.

### 6. Next round

Go again, while budget remains, only after a round that had a confirmed P1: the next round checks its fix. A round with no confirmed P1 ends the loop: fix the P2s you take and the housekeeping, rerun the checks they touch, and stop. Their fixes get no round of their own.

**A recurring class.** The second time a P1 of one class turns up on this PR (an earlier round, an earlier run of this loop, or a human review's point fixed before), its ledger row answers: does this fix close the whole class, or only this case? Closing it names the boundary at file:line (a check every path goes through, a library that solves it, lenses.md "A solved problem") and a test that feeds it a second case of the class. A fix that only patches one more case means the approach is wrong: redesign so the class can't happen, and note the redesign in the ledger. It's the agents' call, under **Decided**, unless it changes what a student sees or grows the scope. Findings of other classes are fixed as usual. Wait for each reply before the next round; a timeout, an error or no reply is not approval.

### 7. Stop

- **Agreed**: a round, or the fix check, with no confirmed P1 on the current head, from the other reviewer or you. Only then write `Agreed at <head sha>` into the PR body's review line.
- **Stuck**: a finding still disputed after two replies, or the budget spent with a P1 open. First run the smallest check that decides it yourself (the reviewer's repro, a test, the docs); still open, both sides in a line each go to the caller's decision card (decision-card.md, "Stuck"), and it blocks the merge. Budget spent is never agreement: the PR body's line says `Review stuck at <head sha>: <open ids>`, and keeps the last agreed sha, if any, as the agreed head.

Report: rounds, the other reviewer's model and effort, base and head, each lens's result (lenses.md, "Results"), the ledger's P1s with their outcome (each with a diagram when it matches [diagrams.md](~/.agents/pr-flow/diagrams.md)'s "When"), the P2s fixed and declined, and one line for the PR body: `Reviewed by Claude and Codex (review-loop, <N> rounds, agreed at <sha>); <what its findings changed>.`, or for Stuck, `Reviewed by Claude and Codex (review-loop, <N> rounds); stuck at <sha>: <open ids>.` Run on its own, shape it by [report.md](~/.agents/pr-flow/report.md) and end with the Links line ([links.md](~/.agents/pr-flow/links.md)); run from another skill, that skill's report carries it.
