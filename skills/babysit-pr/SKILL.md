---
name: babysit-pr
description: 'Watch a PR through CI and review bots, fixing what''s real, until it''s green and ready. Use when the user says "babysit", and from full-send.'
---

# Babysit PR

Keeps one of the user's PRs moving while nobody watches: CI failures fixed, bot findings answered, the branch kept up with its base, until the PR is ready or something needs the user. Adapted from tstack's `babysit-pr` (`scripts/pr-wait` is its script, MIT, see `scripts/LICENSE-pr-wait`).

## Waiting

On CI and reviews, as [waiting.md](~/.agents/pr-flow/waiting.md), "Waiting on CI" says.

## Each wake

- **A check failed**: read its log. Ours: fix it, prove the fix, push. A flake (a timeout, a runner or network error the same commit passed before): rerun it once and say so.
- **A comment or review**: every finding still outstanding, whenever it was posted, until each is fixed or answered; a push doesn't settle one. Check each bot finding against the code; fix a real one, and answer a wrong one with a reason in its thread. A human reviewer's comment is `fix-comments`' work: hand it there.
- **Behind or conflicting**: merge the base in, resolve, rerun the checks it touches. `watch_pull_request` reports conflicts only, so check for behind yourself before calling the PR ready.

**Bots**: the checks branch protection requires are **required**, and the PR waits for them. Review bots (CodeRabbit, Copilot, any other) are **advisory**: answer what they post, never wait for one to start or finish.

Keep the PR the size its goal needs: a bot's nit on a rare path is answered, not built.

## Done

The required checks are green on the latest head, every bot finding is fixed or answered, the branch is up to date, and GitHub reports it mergeable. Merging is `full-send`'s call, or the user's: report the PR ready ([report.md](~/.agents/pr-flow/report.md)), unwatched, ending with the Links line ([links.md](~/.agents/pr-flow/links.md)) and, run on its own, `In sight: ready to merge.` A stop that's blocked or asking ends the same way, `In sight: <why>.` Run from `full-send`, it hands back and `full-send` reports.
