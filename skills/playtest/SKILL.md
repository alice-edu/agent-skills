---
name: playtest
description: 'Play the app as a new student and try to break it, then report what is broken, what is confusing and what could not be tested. Use when the user says "playtest", "QA it" or "try to break it", on main, a branch, or prod.'
---

# Playtest

One agent plays the real app in a browser as a first-time student would, then tries to break it the way a student plausibly would. It runs in a child of its own, so its screenshots and logs stay out of this thread.

## 1. What and where

- **What**: what the user names (a feature, a flow), else the change this thread is working on, else the whole app.
- **Where**:
  - **Local, by default**: the app from `pnpm dev`, on newest `origin/main`, or on this thread's branch when it's testing this thread's change.
  - **Prod, only when the user says so**: the live site, signed in as the QA account. Prod mode in [play.md](play.md) says how.

## 2. Start the player

Start one `delegate_task` on Claude Opus, `role: "test"`:

- for main: `isolation: "worktree"`;
- for this thread's branch: in this checkout.

The brief has:

- "Read ~/.agents/pr-flow/worker.md and ~/.agents/skills/playtest/play.md first, and follow play.md.";
- what to play, where, and the checkout step for main: `git fetch origin && git switch -c playtest/<yyyy-mm-dd> origin/main`. A branch gives the dev URL its own name, which a detached checkout doesn't.

## 3. Report

Relay its report, shaped by [report.md](~/.agents/pr-flow/report.md):

- **Broken**: each with its steps and the screenshot path.
- **Confusing**: the ones a student would trip on first.
- **Couldn't test**: what it couldn't reach, and why.
- What it left behind (test courses, generated podcasts).

End on the next step: a `build-it` thread for the Broken ones (one PR per unrelated bug), once the user says go.
