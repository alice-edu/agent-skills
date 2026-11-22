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

- **P1**: the intended case is wrong, a bug callers will hit, a security hole, data loss, or a broken deploy. Every P1 carries **evidence**: the code path that reaches it, a reproduction, a failing test, or a doc quote. A P1 without evidence is **unconfirmed** (step 4) until it has some: neither fixed nor skipped. From round 1, a P1 comes with a run wherever one can be made (step 2, "Break it"), and one that has a run outranks one that only argues. From round 2, a new P1 in code the fixes didn't touch needs a **run** as its evidence: a failing test, a repro, or command output (a probe script where a race or data loss is hard to reproduce); an argument alone leaves it unconfirmed.
- **Housekeeping**: what lenses.md asks of the PR around the code: leftovers, Test by hand lines, screenshots, the PR body, a missing story. In author mode you fix it directly and list it in the ledger; it is done before the PR is ready, and never starts a round by itself.
- **P2**: a **P2 bug**, one whose harm is cosmetic or clears by itself with nothing for the user to do, and **polish**: naming, style, small performance, a refactor. A P2 bug is fixed like a P1 (step 5); polish is optional. Anything else wrong that a user sees or relies on (a false label, an event sent twice, slowness at a supported size, a step they must redo) is a P1.
- **The user's call**: a finding that's theirs by [decision-card.md](~/.agents/pr-flow/decision-card.md), "Who decides" (the product, or a Simplify? question), whatever its severity. It goes on the caller's decision card, with the answer the reviewers agree on as the default. Every technical finding is settled here by the docs, in both modes.

Re-grade every finding yourself, whatever label it came with. **Grade by harm, from a path that's reachable.** A case is reachable when normal use, the platform or time can produce it, and the code path or a run shows how: another way into the state (opened folded, after a reload, from a link, on first render), a step that fails or answers late, an event that arrives after the user already chose, two tabs, a deploy between two steps, the sizes the repo supports, anything an attacker controls. A reachable case grades as the intended case does: when it breaks the feature, shows something false, or loses work, it's a P1, however unusual the steps. A case nothing can produce (a state the types or the data model rule out) isn't a finding; a speculative one without a path stays unconfirmed until one is shown. Harm a reload can't undo (another student's data, lost work, money, a broken deploy) keeps a finding P1, as does what the repo calls blocking (lenses.md, "Every finding"). So does a rule the repo's agent docs write down, broken by the change (lenses.md, Standards, "One rule at a time"): the rule is the repo's decision already made, whatever the harm today. Where the rule's own words leave the case open, it's the user's call.

## Budget

Every round finds about one new P1 whatever its number, so more rounds never converge by themselves: the budget is what ends the loop.

- A diff of under ~100 changed lines: one round.
- Otherwise up to 2 rounds; 3 while a P1 proven by a run stays open in auth, permissions, data loss, money or concurrency.
- After the last round, when you fixed a P1 or a P2 bug in it, or propose a Not fixed row: one **fix check** by the other reviewer, on the open ids and each fix's diff through its callers, with the case tables (lenses.md, Correctness) redone for what the fixes changed, and its AGREE or DISAGREE on each proposed Not fixed row. It raises nothing new beyond a regression from a fix or another case of a fixed bug's class.
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
- **Two seats, one focus each**, in round 1 of a diff over ~100 changed lines (a council keeps its own four seats, each on every lens): start the other reviewer twice in parallel with the same brief, its `Focus:` line **hunt** on one (Correctness and its case tables) and **rules** on the other (Spec, Standards with RULES, Backend, UI and UX). Your own review covers every lens. Later rounds and the fix check are one seat on every lens.
- **A design seat**, in parallel with the others, once in round 1 of a diff over ~100 changed lines, and again on an area when "A mechanism that keeps breaking" fires (step 6): the other reviewer, with the brief's `Focus:` line **design** (a council's round 1 gives one of its seats this focus too). It looks for no bugs. Its one job: a shape for this change that deletes code or makes cases impossible.

**Break it.** Every seat but the design one is a breaker: for each P1 it tries to prove it with a run, in a scratch worktree of the head (`git worktree add /tmp/break-<n> <head>`), never in the repo's checkout: a failing test, a repro script, command output. Where its sandbox or the case won't allow a run (a race, a deploy, production's data), it says so and gives the code path.

Brief, the same every round:

```
Review only. Edit nothing in the repo, post nothing, start no subagents. Read ~/.agents/pr-flow/worker.md first.
Repo: <abs path>  Base: <sha>  Head: <sha>
Intent: <intent> (source: <issue/PR/words>)  Out of scope: <scope>  Checks: <results>
Focus: <hunt | rules | every lens>: report on your focus's lenses, the others as `other seat`
Break it: for each P1, try to prove it with a run in a scratch worktree of the head
(git worktree add /tmp/break-<n> <head>), never in the repo: a failing test, a repro script,
command output. Give the command and what it printed beside what the intent needs. Where no run
can be made here, say why and give the code path.
Test by hand (author mode): <draft lines, or none>
Diff: git diff <base>..<head> (plus `git status --short` for uncommitted files)
Removed tests: <~/.agents/pr-flow/removed-tests <base> <head> output, or "none">
Read the surrounding code and callers. Review through these lenses: <lenses>, as
~/.agents/pr-flow/lenses.md describes (read it, then the repo's docs as its "The repo's docs"
says: every one that bears on the change, in full).
Report every finding you can show a path to, however unusual the steps, graded as
~/.agents/skills/review-loop/SKILL.md's "Severity" says. Each P1 carries its evidence (code path,
repro, failing test, doc).
Reply:
VERDICT: APPROVE or CHANGES
DOCS: <each repo doc read, by path>
LENSES: <lens>: clear | findings <ids> | N/A | not verified: <why>, one per lens
CASES: the four case tables of lenses.md's Correctness, every row, fine ones too; an empty table is `none: <why>`
RULES: <agent-doc section or doc it points to>: holds | broken <id>, one line each; then `N/A: <the rest, comma-separated>`
<id> [P1|P2] [agents|user] [<lens>] <file>:<line> <claim>. Source: <...>. Evidence: <...>. Fix: <...>
```

The design seat's brief keeps the first block (through `Intent`, `Diff` and the lenses' reading) and replaces `Focus`, `Break it` and everything from `Report every finding` with:

```
Focus: design. Look for no bugs. Find a shape for this change that deletes code or makes cases
impossible: a data-model change (keep a row's identity instead of deleting and remaking it, one
source instead of two kept in step), a type that rules a state out, a library or the platform's
own way, a smaller design that still meets the intent. Read the PR's commits and ledger too:
a run of fixes to one area points at its shape. For each proposal, a sketch: the types or schema
it changes, what it removes (file:line ranges, branches, fields, the cases or ledger ids it
makes impossible), what it costs, and anything a student would see differently.
Area: <the whole change, or the area that kept breaking, with its fixes>
Reply:
VERDICT: KEEP (no shape removes more than it adds) or RESHAPE
<id> [design] <area> <the proposal>. Removes: <...>. Costs: <...>. Student sees: <nothing | ...>
```

From round 2, add the ledger (`fixed in <sha>` / `disagree: <evidence>` / `not fixed: <the proposed Not fixed row>`), the diff since the last round, and: "Check the open ids and the changed code, through its callers; mark each old id resolved or still open. Reopen a settled id only with new evidence. A new id only for a regression from the fixes, or with a run as its evidence. For each `not fixed` row: AGREE or DISAGREE, with why. Classes found so far: <classes>."

### 3. Your own review

While the other reviewer runs, review the same diff yourself, before reading its reply, so the two stay independent. Read the changed code's callers, and apply each chosen lens as lenses.md says, with the repo docs it names and the current docs of each technology it uses (lenses.md, "The technology's way"). In author mode, edit nothing until its reply is in: it is reviewing this head.

Done when every changed file has been read in full with its callers, every doc in the repo's docs for this change (lenses.md) has been read, and your own CASES and RULES are written as the brief asks of the other reviewer.

### 4. Merge

Put both reviews in the ledger: one row a finding, duplicates merged, each with id, severity (re-graded), owner (decision-card.md, "Who decides"), lens, **class** (the way the bug gets through: "an image URL gets past the Mermaid text filter"), file:line, claim, source, evidence, and who raised it. Check each against the code yourself; a finding you can't confirm is marked unconfirmed, not dropped. Compare each reviewer's DOCS with your own list: a doc it missed makes the lenses that doc bears on `not verified` for it, and the next round's brief names the doc. Hold the CASES and RULES lines to the diff the same way: a step, handler, `catch`, fallback or new state in the diff that no reviewer's table has a row for leaves Correctness `not verified`, and a section of the agent docs on neither RULES line leaves Standards `not verified`, until a reviewer (you, or the next round's brief) fills the row in.

### 5. Act

**Author mode**: a user-owned finding waits for the card; the rest are yours. Fix each P1 completely, the whole cause rather than the one symptom ([lenses.md](~/.agents/pr-flow/lenses.md), "The right way"), plus a test that fails without it when the repo has a place for one. Fix housekeeping directly. Fix each P2 that's a bug, the same way, cheap or not. Polish is optional: skip it in one line. A P2 bug stays unfixed only when the other reviewer answers AGREE that its fix costs more than its harm (a new subsystem for a cosmetic glitch): propose the row in the next round's brief or the fix check, quote its answer in the PR body's **Not fixed** (pr-body.md), and fix it on DISAGREE; a fix made on a fix check's DISAGREE gets one more fix check, on its diff only. A fix whose cost comes from the design's shape is a design finding, fixed by changing the shape. More than three rows for Not fixed means the design is wrong: redesign before writing them. Where you disagree, write why with evidence. Then rerun the checks the fixes touch, and compare `git diff --shortstat <base>` with before: growth from doing the change right stays; cut back only what reaches past what the change touches.

**A design proposal** (the design seat's RESHAPE): check its sketch against the code yourself. Adopt it when it removes more than it adds (lines, branches, fields, cases) and still meets the intent, and the open P1s it makes impossible close with it: in author mode, rebuild the area to it before fixing those P1s one by one, and list it under **Decided**. One that changes what a student sees, or grows the scope, is the user's call (the card). One that removes less than it adds is declined in a line with its numbers.

**Reviewer mode**: edit nothing. The ledger, with the user's-call items separated out, is the result; a design proposal you'd adopt goes in it as a suggestion, with its sketch.

### 6. Next round

Go again, while budget remains, only after a round that had a confirmed P1: the next round checks its fix. A round with no confirmed P1 ends the rounds: fix the P2 bugs and the housekeeping, rerun the checks they touch, and send the P2 fixes and any proposed Not fixed rows to the fix check (Budget).

**A recurring class.** Every review of this PR, its human reviews included, adds its P1s' classes to the brief's "Classes found so far", so each later round looks for the class, not only its case. The second time a P1 of one class turns up on this PR (an earlier round, an earlier run of this loop, or a human review's point fixed before), its ledger row answers: does this fix close the whole class, or only this case? Closing it names the boundary at file:line (a check every path goes through, a library that solves it, lenses.md "A solved problem") and a test that feeds it a second case of the class. A fix that only patches one more case means the approach is wrong: redesign so the class can't happen, and note the redesign in the ledger. It's the agents' call, under **Decided**, unless it changes what a student sees or grows the scope. Findings of other classes are fixed as usual.

**A mechanism that keeps breaking.** Count fixes across the PR's whole history, not this run: `git log <base>..HEAD` for the files, every earlier ledger, and fixes from any source (a review, the user, a human reviewer, a bug found while proving). The third fix to one area (a mechanism, a flow, the code around one piece of state), whatever their classes, stops the fixing:

1. **The state each fix guards.** Name it, then ask whether it's legitimate: should that state exist at all? One that shouldn't means a check there hides the bug; find what produces it, usually a data-model choice (a delete that loses identity, a copy that has to stay in step, two flags that must agree), and fix that instead.
2. **The premise.** Write down what every fix so far assumed about the area, and test it directly (a probe, a script, a log) before a fourth.
3. **The design seat** (step 2) on that area, with its fixes listed in `Area:`.
4. **Should it exist?** What the technology documents for this problem, and how other projects solve it (lenses.md, "The technology's way", "How others do it", "Precedent"). Where that way makes the machinery unnecessary, redesign to it.

The ledger records each answer and what was searched. Fixes go on only once none of the four finds a shape that removes the area's run of fixes.

Wait for each reply before the next round; a timeout, an error or no reply is not approval.

### 7. Stop

- **Size**, before Agreed: each area's lines (`git diff --stat <base>`) beside what its part of the intent needs. An area far past that, or one that grew a branch per fix (another `if` for one more case), gets step 6's "A mechanism that keeps breaking" first, from its premise.
- **Agreed**: a round, or the fix check, on the current head with no confirmed P1 open, from the other reviewer or you, and every confirmed P2 bug fixed or in Not fixed with the other reviewer's AGREE. Only then write `Agreed at <head sha>` into the PR body's review line.
- **Stuck**: a finding still disputed after two replies, or the budget spent with a P1 open. First run the smallest check that decides it yourself (the reviewer's repro, a test, the docs); still open, both sides in a line each go to the caller's decision card (decision-card.md, "Stuck"), and it blocks the merge. Budget spent is never agreement: the PR body's line says `Review stuck at <head sha>: <open ids>`, and keeps the last agreed sha, if any, as the agreed head.

**Changing this skill.** An edit that changes how findings are graded or what reviewers look for (Severity, the brief, lenses.md's lenses) is measured before it's kept: [misses.md](~/.agents/pr-flow/misses.md), "Measure a change".

Report: the verdict (agreed at <sha>, or stuck with the open ids), and the ledger's P1s with their outcome (each with a diagram when it matches [diagrams.md](~/.agents/pr-flow/diagrams.md)'s "When"), the P2 bugs fixed and those in Not fixed, and one line for the PR body: `Reviewed by Claude and Codex (review-loop, <N> rounds, agreed at <sha>); <what its findings changed>.`, or for Stuck, `Reviewed by Claude and Codex (review-loop, <N> rounds); stuck at <sha>: <open ids>.` Run on its own, shape it by [report.md](~/.agents/pr-flow/report.md) and end with the Links line ([links.md](~/.agents/pr-flow/links.md)); run from another skill, that skill's report carries it.
