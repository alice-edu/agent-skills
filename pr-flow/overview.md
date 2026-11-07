# Overview

How a review is shown to the user: in `review-pr` (our review of a teammate's PR) and `fix-comments` (a reviewer's points on their). Both use the same shape, so either reads at a glance: the summary line, then their table, then ours, with the detail underneath.

## The shape

1. **Summary line**, one sentence in bold:
   - fix-comments: `**Adam left 6 points:** 3 we'll fix, 2 need you, 1 we're still checking.`
   - review-pr: `**Verdict: changes requested.** 1 blocking, 3 optional, 1 needs you.`
2. **Two tables**, split by owner ([decision-card.md](decision-card.md), "Who decides"):
   - **Product and design (your call)** first: every row of it is on the card.
   - **Technical (we decide)** second.

   Leave out a table with no rows. Number the rows across both tables (1, 2, 3 …), so the user can answer "go, but 2 the other way".
3. **Details**, under the tables: the card's question for each row on it, written as [decision-card.md](decision-card.md) "How to ask" says, and a diagram's screenshot. Then one line per row giving its confidence's evidence. On GitHub, the details go in a `<details>` block.
4. The Links line ([links.md](links.md)).

## The columns

| Point | What it means | Recommended | Conf. |
|---|---|---|---|
| 1. **UX** · [Hide Retry while grading](…) | Button vanishes ~5s, no reason given | ✅ Fix: keep it, disabled, "Grading…" | High |
| 2. **Flow** · [Grade per question](…) · [diagram](…) | Results show one by one, not at the end | ✅ Fix: behind the same Submit | Med |
| 3. **Perf** · [Query reads all files](…) | Slows down on big courses | ✅ Fix: index by course | High |

- **Point**: the number; the kind in bold; the point in six words or fewer, linked to its comment (fix-comments) or its `file:line` (review-pr); `· [diagram](…)` when it has one.
- **Kind**, one of a fixed set. Product: **UX**, **Copy**, **Flow**, **Scope**. Technical: **Bug**, **Perf**, **Design**, **Cleanup**, **Test**.
- **What it means**: in the product table, what a student sees or does; in the technical table, the cause and effect in plain words. No code names or file paths in either: parts are named as they look on screen. The test: someone who hasn't read the code understands the row.
- **Recommended**: one emoji and a word, then the action, verb first.
  - fix-comments: ✅ **Fix**, 💬 **Push back** (the reviewer is wrong, with evidence), ⏭️ **Skip** (optional, and it doesn't matter here).
  - review-pr: 🔴 **Blocking**, 🟡 **Optional**, ⚪ **Drop** (not worth posting).
- **Conf.**: High, Med or Low.

Each cell stays under about 60 characters. Whatever doesn't fit goes in the details.

## Confidence

Confidence is how sure we are of the recommendation, taking the weaker of two things: whether the claim is right, and whether the fix is right.

- **High**: the claim is checked in the code or by a test or repro, and the fix is checked against its callers and tests.
- **Med**: the mechanism is plausible, but the repro, the requirement or what else it touches is unverified.
- **Low**: the evidence is missing, sources conflict, or it rests on an untested assumption.

A reviewer's certainty is no evidence: check every point against the code before grading it, and grade a wrong one 💬 Push back with what shows it's wrong. A technical row below High is the agents' to raise: investigate (docs, a test, a repro) until it's High, or until it's Stuck (decision-card.md).

## Diagrams

A row gets a diagram when its recommendation changes how something works (a flow, the shape of the data, the order of steps), even where diagrams.md's "When" would skip it: before and after, drawn per [diagrams.md](diagrams.md), showing what a student sees before code names. One diagram can serve several rows.
