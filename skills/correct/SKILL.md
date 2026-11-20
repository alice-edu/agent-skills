---
name: correct
description: 'Find the mistakes agents keep repeating in a repo and make each one impossible: architecture first, then types, then a lint whose error names the fix, then a test, and an agent rule only last. Use when the user says "correct", or when reflect finds a mistake a check could catch.'
---

# Correct

The user keeps correcting agents in this repo for the same mistakes. Change the repo so the next agent can't make them.

Picture every contributor as an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. A change that looks right from one file should be right for the whole repo.

Adapted from poteto's [pstack](https://github.com/cursor/plugins/tree/main/pstack) (MIT).

## 1. Find the mistake classes

Read the evidence: recent reverts and fix-ups, review comments (the PRs' and the review-loop ledgers' **class** column), the user's corrections in threads, the repo's `AGENTS.md` and what it points to, and comments explaining a workaround. Group them into **classes**: the way the mistake gets in ("text written into a ternary skips translation"), not the one case. A class counts once it has happened twice; give each its two or more cases with links.

Done when each class has its cases, and the list is ordered by how often it happens and what it costs.

## 2. Pick the highest level that works

For each class, the highest of these that can stop it:

1. **Architecture**: one owner for each piece of state, one supported way for each task. Hide internals so the wrong import fails, replace hand-synced lists with one source of truth, delete the old way and dead code an agent would copy.
2. **Types**: the bad state can't be written. When bad code still compiles, a lint or CI check whose error names the file, type or function to use instead. When the pattern is already common, the check fails only on a change that adds more.
3. **A test** of the behaviour. A test that still passes when the behaviour breaks, or fails when only the internals change, is fixed or deleted.
4. **An agent rule** (`AGENTS.md`, a skill), only for a judgment call no check can make: nothing fails when an agent skips it.

Done when each class has its level, and why each higher one doesn't work.

## 3. Fix and prove

Fix the most frequent classes, one PR each, through `build-it` (Build, with the class and its cases as the design). Prove each new check fails on a real past mistake: check out or replay one of the class's cases and paste the check's error. It runs the same locally and in CI. An exception sits on the offending line with a reason and the user's approval.

An `AGENTS.md` rule that a check now enforces shrinks to a pointer to the check, or goes once the mistake can't happen.

**Reply** per [report.md](~/.agents/pr-flow/report.md): each class with its cases, the level picked and why a higher one didn't work, its PR, and the check's error on the past mistake.
