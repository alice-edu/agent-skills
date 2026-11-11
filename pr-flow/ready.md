# Ready

What "ready for review" means for a PR of the user's. `build-it`, `fix-comments` and `full-send` hold the PR to this before handing it on; `send-for-review` checks it is still true. The repo's `AGENTS.md` and `.github/pull_request_template.md` say how this repo builds, tests and writes things; this file adds what they leave out. Where the template and `AGENTS.md` disagree (the template names two languages, `AGENTS.md` all six), `AGENTS.md` wins.

## Proof

Proof is evidence observed in this session on the current **head** (the PR's latest commit, with its base merged in): command output, a test that went red without the change and green with it, the running app. Green mocked tests prove the logic; for a change a student sees, proof is the change seen in the running app (`pnpm dev`, the `run` skill), used as a student would: upload the file, send the message, get the answer graded. What that bills (models, grading, reading a file) is part of testing and needs no asking; reuse an upload that already does the job. A check run on an earlier head is history, not proof: after any commit or merge of the base, rerun what the change could affect.

## The checklist

The PR body ends with the checklist (shape in [pr-body.md](pr-body.md)). It is the record of every check this run made, so a reviewer sees what is done and what is left to them:

- `- [x]` marks a requirement that **passed** on the current head, with its evidence: the command, the result, the short SHA (`- [x] Vitest, web: 675 pass at abc1234`).
- A check that fails is written as failing with the reason, and the PR is not ready.
- A requirement that doesn't apply is `- N/A: <requirement>: <why>`, never a tick.
- **Test by hand** lists, unticked, what a person should check because it couldn't be proven here: what to do, what should happen, and why it wasn't tested (needs production data, a real phone, another account). This is also what whoever checks production works from.

Every item below ends as `[x]`, `N/A` or a Test-by-hand line:

1. The template's items, each one.
2. The checks CI runs for what the PR touches (`AGENTS.md`, "CI"): typecheck, lint, format, tests of the touched packages.
3. The base merged in before those final checks, so a key or type another PR added is in the run.
4. Docs read for the installed version wherever the diff calls an outside package's API in a new way, each named (`next-intl 4.3 useTranslations`, `convex-helpers workpool`). The installed version is in `node_modules/<pkg>/package.json`; its bundled docs or the docs site for that version.
5. Edge cases: the ones handled, each with its test, and the ones left on purpose, each with why.
6. A file this PR made large or grew a lot: split considered, with the outcome. Only files the PR itself grew.
7. Screenshots for every change a student can see ([screenshots.md](screenshots.md)).
8. `review-loop` agreed on this head.

## Make it ready

The gate before a reviewer sees the PR: `send-for-review` runs it before posting, and it runs alone when the user asks "is it ready?". The user often keeps changing a PR in its thread after `build-it` opened it, and those commits get no review of their own; this is where they get one.

1. **What changed**: the head `review-loop` last agreed on is in the checklist's item 8 (`review-loop agreed at <sha>`). The current head is that one, with nothing new on the base: reuse it all and go to 4.
2. **Review it**: merge the base in, then review until it would pass, as `build-it`'s step 8 ([its loop and its Done when](~/.agents/skills/build-it/SKILL.md)), on the **whole PR**, not only the new commits: a later change can undo why an earlier one was made, and the reviewer reads it whole.
3. **Prove it again** on the new head: the checks above, the change seen in the running app when a student can see it, and screenshots retaken where the screen changed.
4. **Rewrite the PR body** for where the PR ended up, not where it started ([pr-body.md](pr-body.md)): what changed, the behaviour table, the checklist with this head's SHA, the screenshots.

Done when every checklist item is `[x]`, `N/A` or Test by hand on the current head, item 8 included. A P1 the loop can't settle stops it: it goes on the decision card, and the PR isn't announced while it's open.

## Reuse

A check recorded against the same base and head is still proof. A later skill reruns only what a new commit or merge could have changed, and says which checks it reused.
