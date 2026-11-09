---
name: babysit-pr
description: 'Watch a PR through CI and review bots, fixing what''s real, until it''s green and ready. Use when the user says "babysit", and from full-send.'
---

# Babysit PR

Keeps one of the user's PRs moving while nobody watches: CI failures fixed, bot findings answered, the branch kept up with its base, until the PR is ready or something needs the user. Adapted from tstack's `babysit-pr` (`scripts/pr-wait` is its script, MIT, see `scripts/LICENSE-pr-wait`).

## Waiting

One watcher a PR, never a loop of your own:

- **In T3 Code**: handle what's already there, then `watch_pull_request` and end the turn. T3 wakes the thread when a check fails, the required checks pass, someone comments or reviews, or the branch conflicts. A wake is news; check the gate yourself. Only the thread that owns the PR watches it: a delegated child never does. Before handing back (ready, blocked, or asking), `unwatch_pull_request`. "Could not read it" usually means GitHub's GraphQL limit is spent: `gh api rate_limit --jq .resources.graphql`, and wait for its `reset` once before watching again.
- **Elsewhere**: `scripts/pr-wait <pr> --until ready` (absolute path from this skill's folder), run with Claude Code's Monitor tool, or as one long command. One line a real event; exit 0 when the condition is met or the PR merged, 1 when it needs you, 2 on bad input. Start it again after each push.

An event that needs nothing: end the turn without a message.

## Each wake

- **A check failed**: read its log. Ours: fix it, prove the fix, push. A flake (a timeout, a runner or network error the same commit passed before): rerun it once and say so.
- **A comment or review**: every finding still outstanding, whenever it was posted, until each is fixed or answered; a push doesn't settle one. Check each bot finding against the code; fix a real one, and answer a wrong one with a reason in its thread. A human reviewer's comment is `fix-comments`' work: hand it there.
- **Behind or conflicting**: merge the base in, resolve, rerun the checks it touches. `watch_pull_request` reports conflicts only, so check for behind yourself before calling the PR ready.

**Bots**: the checks branch protection requires are **required**, and the PR waits for them. Review bots (CodeRabbit, Copilot, any other) are **advisory**: answer what they post, never wait for one to start or finish.

Keep the PR the size its goal needs: a bot's nit on a rare path is answered, not built.

## Done

The required checks are green on the latest head, every bot finding is fixed or answered, the branch is up to date, and GitHub reports it mergeable. Merging is `full-send`'s call, or the user's: report the PR ready ([report.md](~/.agents/pr-flow/report.md)), unwatched, ending with the Links line ([links.md](~/.agents/pr-flow/links.md)).
