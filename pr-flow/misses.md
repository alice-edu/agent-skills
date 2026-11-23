# Misses

The P1s a human review found on the user's PRs after `review-loop` had agreed on them. Each is a case the loop should have caught, kept with the commit it reviewed, so a change to the loop can be measured on real bugs rather than judged by how it reads.

## Add one

`fix-comments` adds a row for each ✅ P1 the PR's own loop had reviewed and not raised. One row a cause, its columns:

- **PR** and the **reviewed** commit: the head the human review was written at (`gh api repos/<o>/<r>/pulls/<n>/reviews --jq '.[] | [.commit_id, .state] | @tsv'`).
- **Class**: the way the bug gets through, in general words ("an optional step's failure breaks the feature"), from the list below; a new class only when none fits.
- **Where**: file:line at the reviewed commit.
- **What**: the bug in one line, as the reviewer showed it.
- **Set**: `design` when a change to the loop was written from it, `held-out` otherwise. A row stays held-out until a change is written from it.

Classes: *ways in* (another way into a state), *failure path*, *ordering* (concurrency, a late event), *library assumed*, *repo rule*, *scale*, *claim* (text or event says what the code doesn't do), *abuse and cost*, *deploy skew*, *test removed*, *logic edge* (a parser's or editor's input), *design*.

## Measure a change

An edit that changes how findings are graded or what reviewers look for (`review-loop`'s Severity and brief, lenses.md) is kept when it catches more held-out misses than the loop before it, at the right grade, without more P1s that turn out wrong. Wording and workflow edits aren't measured.

1. Pick at least four held-out rows of four different classes, none the change was written from.
2. For each, a scratch worktree at its reviewed commit (`git worktree add /tmp/miss-<pr> <sha>`), and `review-loop` in reviewer mode, one round, on the PR's base..reviewed: the ordinary brief, with no word of the miss. One run with the loop as it was before the change (its files from the skills repo, the one `~/.agents/pr-flow` links to, at the commit before: `git -C "$(dirname "$(readlink ~/.agents/pr-flow)")" show <before>:<file>`, saved under `/tmp` and named in the brief in place of the current ones) and one with the change.
3. **Caught**: the ledger names the same cause (the same failure, through the same code); **graded right** when it's a P1, or a P2 bug that gets fixed. Count as well the P1s the run raised that the code doesn't bear out. One run is noisy: where before and after differ on a row, run that row once more each and count it only if it holds.
4. A row in Runs below for each, then remove the worktrees. Rows the change was written from become `design`.

## Runs

| Date | Change | Miss | Before | After | Wrong P1s (before/after) |
| --- | --- | --- | --- | --- | --- |
| 2026-11-21 | Severity by harm, case tables, rules one at a time, Not fixed with AGREE (Claude Opus, one seat, every lens) | #937 ordering | missed | missed (same line, another failure) | 1 / 0 |
| 2026-11-21 | same | #1090 library assumed | missed | caught (P2: the loop it risks unproven) | 0 / 1 |
| 2026-11-21 | same | #935 claim | part (refusals not told apart) | caught | 1 / 1 (the same read-aloud P1 both) |
| 2026-11-21 | same | #759 repo rule | caught as an optional P2 | caught, graded P2; "a written rule broken is P1" added from it | 0 / 0 |
| 2026-11-22 | Breakers prove P1s with runs, design seat, fixes counted across the PR (Claude Opus, one seat every lens, plus the design seat over ~100 lines) | #1572 design | caught as a P2, the user's call (the lead stays once everything's imported) | caught, the same P2 user's call; the design seat looked at the lead's check and kept it | 0 / 0 (both raised "the welcome isn't built" from an intent taken from the final PR body: not counted) |
| 2026-11-22 | same | #783 failure path | caught as a P2, both runs (a failed summary leaves the row "Every file ready" and Publish refuses) | caught, P1 with a run, then P2 (the user's) on the rerun; the design seat named the cause in a note, not a proposal | 0 / 0 |
| 2026-11-22 | same | #903 ordering | missed | missed (the design seat looked at begin/finish/drop and kept it) | 0 / 0 |
| 2026-11-22 | same | #867 library assumed | caught as a P2, both runs (a rerun without `{reset: true}` is a no-op) | caught, P1 with a run, then P2 on the rerun | 0 / 0 |

## Rows

| PR | Reviewed | Class | Where | What | Set |
| --- | --- | --- | --- | --- | --- |
| #726 | 665dbdc9f3 | ways in | packages/backend/convex/lib/learned.ts:57 | An answer with no format is read as the student's own mark, but answers carried over from knowledge blocks have none too, so the backfill tags them `marked` | held-out |
| #1057 | 7d4512e932 | ways in | packages/backend/convex/teams.tsx:258 | `join` returns the member state before the email check and then deletes the invite, so any teammate with the link uses up an invite meant for someone else | held-out |
| #1664 | 8a4afa0a04 | ways in | scripts/phone-native.mts:215 | The store build is found by the cut's commit being in main's history, which holds only for a merge commit; the ruleset also allows squash and rebase, and either one blocks every phone PR and cut | held-out |
| #871 | 5dbe036ed9 | ways in | apps/web/app/(app)/(dashboard)/courses/[courseId]/notes/pasting.ts:216 | `transformPasted` also runs on drag-and-drop inside the note, so each dragged equation, table or image gains an empty paragraph | design |
| #1252 | e714df5647 | ways in | apps/web/app/(app)/(dashboard)/courses/[courseId]/Course.tsx:1087 | With the panels hidden, opening the file's Summary or Learning goals tab keeps them hidden and removes the only control that shows them again | design |
| #783 | 295d3cf2f2 | failure path | packages/backend/convex/published.ts:430 | `summarize` catches its error and the file still turns done; `copyToLibrary` then throws `notReady` and nothing schedules it again, so the course is never published | held-out |
| #915 | 0ebc04ae40 | failure path | packages/backend/convex/courseZipsNode.ts:258 | `marked()` catches every error, including a transient Azure 503 or timeout, and records the file `unmarked` for good, so the ZIP ships without highlights a retry would have added | held-out |
| #1043 | dc3f1933b2 | failure path | apps/web/app/(app)/(dashboard)/courses/[courseId]/notes/blocks.tsx:121 | The line split is saved even when the toggle after it fails (`chain().run()` applies the shared tr), so the paragraph is broken up and nothing is made | design |
| #937 | fa4523cd3b | ordering | apps/web/app/(app)/(dashboard)/courses/[courseId]/Chat.tsx:447 | `lastDrawn` skips only rows that draw nothing; a check record landing after Alice's reply becomes the last row, and the stage's Try again shows nowhere | held-out |
| #903 | 6c69a4d26d | ordering | packages/backend/convex/shareCopies.ts:121 | The copied note's row shows in Sources before `finish` writes its document; opening it first makes an empty snapshot, `finish` throws and `drop` leaves the row behind | held-out |
| #1428 | d3149f7572 | ordering | apps/mobile/src/ChatView.tsx:562 | Send empties the box at once, but `answering` turns waiting only when the message arrives, so in between the button is an enabled Call | held-out |
| #1070 | d9f6c8f190 | ordering | apps/web/app/(app)/(dashboard)/popups.ts:82 | `useCovered` checks for an open dialog only in an effect, so the first render gives a paced pop-up its turn over a dialog already open | design |
| #1090 | 2a0b930894 | library assumed | apps/web/app/(app)/(dashboard)/courses/[courseId]/call/useCall.tsx:354 | `agent.attributes` is a new frozen object each render (livekit-client's getter), so the effect that has it in its deps runs every render and sets state each time | held-out |
| #867 | c7d200c843 | library assumed | packages/backend/convex/migrations.ts:215 | "Run it again" does nothing: `@convex-dev/migrations` skips a migration it has seen finish unless passed `{reset: true}` | held-out |
| #741 | eeae39e809 | library assumed | apps/web/app/(app)/(dashboard)/courses/[courseId]/package/useExamPackage.ts:117 | Cancel calls `worker.terminate()`, after which neither `onmessage` nor `onerror` fires, so the promise never settles and its `finally` never runs | design |
| #1550 | cc75a448a6 | library assumed | apps/web/app/(app)/browserMessages.ts:14 | Sonner draws the What's new toast under the root `<Toaster />`, so it reads the root messages provider, not the dashboard's, and shows its keys | design |
| #759 | 986f88c05e | repo rule | apps/web/lib/site.ts:9 | `siteUrl` works out the environment from which platform vars exist, against AGENTS.md's one var named for what it does, set per environment | design |
| #924 | 0480d7e097 | repo rule | packages/backend/convex/prompts/tutor.ts:22 | P3 in Alice's prompt changes, but `teaching-method.md` and the P3 eval scenarios still say the old rule | held-out |
| #1618 | 426be32c0f | repo rule | packages/backend/convex/auth.ts:73 | The phone's test-account button now depends on a hostname check (`CONVEX_CLOUD_URL` is 127.0.0.1), against AGENTS.md's no-environment-checks rule | held-out |
| #1634 | 50222152d9 | ways in | packages/backend/convex/opened.ts:127 | The texts moved off the video row to `videoTexts`, but `watchingOf` still reads `p.transcript` off the row, so Alice is told no open video has a transcript once the migration runs | held-out |
| #1545 | a562dac840 | scale | packages/backend/convex/spend.ts:43 | The paid-or-not check `.collect()`s every entitlement row the user ever had, on every paid call of a paused day | held-out |
| #707 | d0dcc84c28 | claim | packages/backend/convex/tutor.ts:3646 | The tool text tells Alice to send all of a topic's objectives, but `picks.setFor` throws past 25, so "take topic X out of my aim" fails | held-out |
| #1554 | 4a376418cd | claim | packages/backend/convex/lib/platform.ts:2646 | Alice's page says queries and file paths are cut from error messages, but `withoutQueries` handles only `http(s)://` and `file://`, not bare paths or `content://` | held-out |
| #935 | 54931b622a | claim | apps/web/app/(app)/(dashboard)/courses/[courseId]/package/useExamPackage.ts:96 | `course_download_started` is sent before `makeZip` checks anything, so a refused download counts as started | held-out |
| #903 | 6c69a4d26d | abuse and cost | packages/backend/convex/saveShared.ts:68 | `save` has no rate limit, and each call copies every MP3 or image of the shared item inside Azure | held-out |
| #867 | e3c43d9fca | abuse and cost | packages/backend/convex/migrations.ts:439 | A migration making paid, uncapped model calls is in `runAll`, so it runs by itself on deploy with no count or cap | held-out |
| #1618 | 426be32c0f | deploy skew | apps/mobile/scripts/phone.mts:143 | The runtime check compares the update with this checkout's fingerprint, not the dev build on the phone, so an update the phone can't load passes | held-out |
| #1595 | 110f93257b | deploy skew | .github/workflows/phone-deployed.yml:148 | A native PR into `release/next` during a store rollout gives it a fingerprint no store build has, so phones on the rolling build silently get no more JS | design |
| #1169 | 62e979470b | test removed | packages/backend/convex/goals.test.ts:1533 | The 120 s timeout is removed from a 99-file test, leaving Vitest's 15 s wall-time default, which the CPU-time change doesn't cover | held-out |
| #760 | ee09536462 | logic edge | packages/backend/convex/groups.ts:263 | The no-op check compares with `withoutEmoji(doc.name)`, so renaming "Plan 📝" to "Plan" counts as already done and nothing changes | held-out |
| #773 | 16482a523f | logic edge | packages/backend/convex/lib/youtube.ts:64 | `secondsOf` takes only 1–2 digit parts, so a stamp past 99 minutes ("112:30") is undefined and its segment is dropped from the source | held-out |
| #1647 | bf0e086045 | logic edge | packages/backend/convex/study.ts:287 | `descriptionOf` strips every `#`, `*`, `_` and backtick from the admin's own text too: "C#" is saved as "C" | design |
| #1572 | 364acdaa9e | design | apps/mobile/src/Home.tsx:315 | The empty course leads with importing from old Alice on every new course for good, even after everything is imported | held-out |
| #1700 | a494758 | design | packages/backend/convex/groups.ts:568 | An organize hard-deletes folders, so undo remakes them with new ids and every older organize is rewritten (naming, renamedIn, foldersNamed): 14 of 27 commits patched it one case at a time | design |
| #1694 | fbb81c8b37 | logic edge | apps/web/app/(app)/(dashboard)/courses/[courseId]/useStudyFit.ts:160 | The ResizeObserver watches the title row only if it's drawn when the effect runs, so a Study panel opened folded never refits as the paused focus timer wraps under the tabs | held-out |
| #1740 | 6768731557 | ways in | apps/web/app/(app)/(dashboard)/courses/[courseId]/Summary.tsx:189 | Removing the course screen's bottom band also unprotected the summary's and the note's read-aloud players and a transcript's Back to the line; only the PDF's player was raised, so Ask Alice covered the speed button in a narrow pane | held-out |
| #1742 | 2d518dcc3d | ordering | packages/backend/convex/sources.ts:394 | A read waiting in the line past 30 min counts as stuck, so its Retry cancels nothing (no run yet) and starts a second run beside the start still queued for it | held-out |
| #1742 | 2d518dcc3d | scale | apps/web/app/(app)/(dashboard)/courses/[courseId]/SourceRows.tsx:1112 | Any upload going up from another tab past 10 min shows Stopped, so a large file on a slow link still uploading is deleted by Upload again | held-out |
| #1700 | abeefcfec8 | docs drift | packages/backend/convex/lib/platform.ts:453 | Alice's help page still said a dragged folder flattens into file names "exactly as" the Classic import does, after the PR made uploads nest; the loop checked the platform page existed for the feature, not that its old comparisons still held | held-out |
| #1589 | 52d8dd9730 | scale | packages/backend/convex/sourceSearches.ts:271 | Adding every find of a search (up to 30 pages) took one of the user's 20 links an hour each, so the add threw past the twentieth and rolled back: the more a search found, the surer that Add added nothing | held-out |
| #1589 | 52d8dd9730 | design | packages/backend/convex/schema.ts:3687 | A search kept two overlapping fields for where it is (`state` searching/ready/added, `stage` planning to ranking), so every reader had to agree on which pair of values meant what | held-out |
