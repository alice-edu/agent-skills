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

- **P1**: the intended case is wrong, a bug callers will hit, a security hole, data loss, or a broken deploy. Every P1 carries **evidence**: the code path that reaches it, a reproduction, a failing test, or a doc quote. A P1 without evidence is a P2 until it has some.
- **P2**: everything else: another path, a rare case, small performance, naming, style, a refactor. Optional.
- **The user's call**: a finding that's theirs by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides" (the product, or a Simplify? question), whatever its severity. It goes on the caller's decision card, with the answer the reviewers agree on as the default. Every technical finding is settled here by the docs, in both modes.

Re-grade every finding yourself, whatever label it came with. A rare or speculative case is P2 even from a confident reviewer, except where the repo calls it blocking (lenses.md, "Every finding").

## Budget

- A diff of under ~100 changed lines: one round, then one check of the fixes.
- Otherwise up to 3 rounds; up to 5 while a P1 with evidence stays open in auth, permissions, data loss or concurrency.
- Stop early when a round returns only P2s.

## Council

Four seats, one from each model line: Codex's **Sol** and **Astra**, Claude's **Opus** and **Fable**, each the newest of its line, at high effort. In T3 Code, read the ids from `orchestrator_capabilities`. Outside it, a seat whose model id can't be named for certain from the CLI's own model list is unavailable. You hold a seat only when your own model and effort match it; otherwise you coordinate and all four are delegated. A line that isn't listed, or a seat that errors, is named in the report. A council with fewer than three seats, or with only one provider left, is a normal review, and the report says so.

- **Round 1**: every seat gets the same brief (step 2) at the same time, and you write your own review before reading any of theirs (step 3).
- **Wait for all of them**: merge, edit and judge agreement only once every seat has replied or clearly failed.
- **Merge** (step 4): each ledger row also records which seats raised it. A P1 from one seat only is checked against the code by you before it counts. One raised by two seats or more is more likely real, but still needs its evidence.
- **Round 2 on**: only you and the other provider's newest seat (Sol when you are Claude, Opus when you are Codex), as in a normal loop, so it can still finish. A seat whose P1 is still disputed gets the dispute in a reply of its own once. After that, the dispute goes to the caller's card (step 7).
- **Budget**: the same as a normal loop, counting round 1 as one round.

The report names every seat with its model and effort, and for each P1, the seats that raised it.

## Steps

### 1. Scope

Find the base (`git merge-base HEAD origin/<base branch>`, or the PR's `baseRefName`) and the head SHA. Write the **intent** in one or two sentences (from the PR, the Linear issue, or the user), quoting its source, and what is out of scope. Pick the lenses that apply (lenses.md). Note the checks already run on this head and their results.

In author mode, commit first, so the head names exactly what is reviewed; review a clean tree only. When this thread already holds an agreed ledger for this base and head, with the same mode, lenses and seats (a council asked for after a two-reviewer loop isn't one), and the tree is clean, the loop is done: return it, unless the caller asks for a fresh review (fix-comments does).

Done when base, head, intent and the checks are written down.

### 2. Start the other reviewer

(A council's round 1 starts the three other seats here, in parallel, each with its own `clientRequestId`. Outside T3, a seat on your own provider is `claude -p --model <id> --permission-mode plan` or `codex exec -m <id> -s read-only`.)

- **In T3 Code**: `orchestrator_capabilities` once, then `delegate_task` with `role: "review"`, `mode: "async"` and a new `clientRequestId` each round, on the other provider's newest model at high effort (Codex: the newest GPT, the `sol` line when listed; Claude: the newest Opus). Name the model and effort in the report.
- **Outside T3**: from Claude, `codex exec -s read-only "<brief>"` in the repo; from Codex, `claude -p --permission-mode plan "<brief>"` in the repo (plan mode reads but never edits).
- No route to the other provider: say so and stop. A second review on the same model is no substitute.

Brief, the same every round:

```
Review only. Edit nothing, post nothing, start no subagents.
Repo: <abs path>  Base: <sha>  Head: <sha>
Intent: <intent> (source: <issue/PR/words>)  Out of scope: <scope>  Checks: <results>
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

From round 2, add the ledger (`fixed in <sha>` / `disagree: <evidence>` / `declined: <why>`), the diff since the last round, and: "Check the open ids and the changed code, through its callers; mark each old id resolved or still open. Reopen a settled id only with new evidence."

### 3. Your own review

While the other reviewer runs, review the same diff yourself, before reading its reply, so the two stay independent. Read the changed code's callers, and apply each chosen lens as lenses.md says, with the repo docs it names and the current docs of each technology it uses (lenses.md, "The technology's way"). In author mode, edit nothing until its reply is in: it is reviewing this head.

Done when every changed file has been read in full with its callers, and every doc in the repo's docs for this change (lenses.md) has been read.

### 4. Merge

Put both reviews in the ledger: one row a finding, duplicates merged, each with id, severity (re-graded), owner (decision-card.md, "Who decides"), lens, file:line, claim, source, evidence, and who raised it. Check each against the code yourself; a finding you can't confirm is marked unconfirmed, not dropped. Compare each reviewer's DOCS with your own list: a doc it missed makes the lenses that doc bears on `not verified` for it, and the next round's brief names the doc.

### 5. Act

**Author mode**: a user-owned finding waits for the card; the rest are yours. Fix each P1 completely, the whole cause rather than the one symptom ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"), plus a test that fails without it when the repo has a place for one. Take each P2 that matters for what the change touches, cheap or not. One that doesn't really matter is optional: skip it in one line, as optional rather than a follow-up. Where you disagree, write why with evidence. Then rerun the checks the fixes touch, and compare `git diff --shortstat <base>` with before: growth from doing the change right stays; cut back only what reaches past what the change touches.

**Reviewer mode**: edit nothing. The ledger, with the user's-call items separated out, is the result.

### 6. Next round

Go again when budget remains and a P1 is open, or code changed since the other reviewer last looked. New P2s alone don't start another round. Wait for each reply before the next round; a timeout, an error or no reply is not approval.

### 7. Stop

- **Agreed**: neither reviewer has an open P1 on the current head, and neither do you.
- **Stuck**: a finding still disputed after two replies, or the budget is spent with a P1 open. First try a check that decides it (a test, a repro, the docs); still open, both sides in a line each go to the caller's decision card (decision-card.md, "Stuck"). Budget spent is never agreement.

Report: rounds, the other reviewer's model and effort, base and head, each lens's result (lenses.md, "Results"), the ledger's P1s with their outcome (each with a diagram when it matches [diagrams.md](~/.agents/pr-flow/diagrams.md)'s "When"), the P2s fixed and declined, and one line for the PR body: `Reviewed by Claude and Codex (review-loop, <N> rounds); <what its findings changed>.` Run on its own, shape it by [report.md](~/.agents/pr-flow/report.md) and end with the Links line ([links.md](~/.agents/pr-flow/links.md)); run from another skill, that skill's report carries it.
