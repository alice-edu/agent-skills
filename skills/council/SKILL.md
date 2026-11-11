---
name: council
description: 'Have four models review a change instead of two: Codex Sol and Astra, Claude Opus and Fable. Use when the user says "council", alongside build-it, review-pr, fix-comments or full-send, or on its own.'
---

# Council

The council is a mode of `review-loop`, set out there under "Council". This skill only switches it on.

- **With another skill** (the Council chip beside Build It, or "review this, council"): run that skill as usual, and the first `review-loop` it starts this run is a council. Later loops in the run (fix rounds, a rewrite) are normal two-reviewer loops, unless the user says "council" again. In author mode the findings get fixed; in reviewer mode they go into the review.
- **On its own** ("council this"): `review-loop` as a council on the current branch's change, or on the PR the user points at. Use **author** mode when it's the user's change and **reviewer** mode otherwise. Report the ledger without fixing or posting anything, unless the user asks.

Done when `review-loop` has stopped and its report names every seat.
