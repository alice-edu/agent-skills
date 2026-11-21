---
name: babysit-pr
description: 'Watch a PR through CI and review bots, fixing what''s real, until it''s green and ready. Use when the user says "babysit", and from full-send.'
---

# Babysit PR

Keeps one of the user's PRs moving while nobody watches: CI failures fixed, bot findings answered, the branch kept up with its base, until the PR is ready or something needs the user. Adapted from tstack's `babysit-pr` (`scripts/pr-wait` is its script, MIT, see `scripts/LICENSE-pr-wait`).

## Waiting

On CI and reviews, as [waiting.md](~/.agents/pr-flow/waiting.md), "Waiting on CI" says.

## Each wake

- **`phone-native` failed**: the PR's base, not its code: [branches.md](~/.agents/pr-flow/branches.md), "phone-native red".
- **A check failed**: read its log. Ours: fix it, prove the fix, push; a fix that changes what a student sees retakes its pictures (screenshots.md, "Keep them current"). A flake (a timeout, a runner or network error the same commit passed before): rerun it once and say so; red again the same way, it's `In sight` with its log, never a third run. Only a failure in what the diff touches gets a commit.
- **A test that fails on the base too**: before fixing or rerunning a failure in something the PR didn't touch, look at the same check on the base's latest runs (`gh run list --workflow <file> --branch <base>`, its failed log). Failing there with the same test is the base's, not this PR's: don't fix, rerun or wait on it here. Say which test and the base's run in the report, and go on as if it passed when it isn't required; when it is, that's `In sight: <check> red on <base> too`.
- **A comment or review**: every finding still outstanding, whenever it was posted, until each is fixed or answered; a push doesn't settle one. Check each bot finding against the code; fix a real one, and answer a wrong one with a reason in its thread. A human reviewer's comment is `fix-comments`' work: hand it there.
- **Behind or conflicting**: merge the base in, resolve, rerun the checks it touches. `watch_pull_request` reports conflicts only, so check for behind yourself before calling the PR ready.

**Bots**: the checks branch protection requires are **required**, and the PR waits for them. Review bots (CodeRabbit, Copilot, any other) are **advisory**: answer what they post, never wait for one to start or finish. Deploy bots' comments (Vercel's and Expo's preview links, posted again on each push) ask nothing: they're no finding and need no answer.

Keep the PR the size its goal needs: a bot's nit on a rare path is answered, not built.

## Done

The required checks are green on the latest head, `screenshots-stale` says current, every bot finding is fixed or answered, the branch is up to date, and GitHub reports it mergeable. Merging is `full-send`'s call, or the user's: report the PR ready ([report.md](~/.agents/pr-flow/report.md)), unwatched, ending with the Links line ([links.md](~/.agents/pr-flow/links.md)) and, run on its own, `In sight: ready to merge.` A stop that's blocked or asking ends the same way, `In sight: <why>.` Run from `full-send`, it hands back and `full-send` reports.
