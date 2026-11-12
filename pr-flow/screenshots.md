# Screenshots

For any change a student can see: rendered UI, copy, layout, styling, an interaction state. A refactor whose screen is identical needs none. What **moves** gets a recording too ("Recording" below). Both are made without asking, whenever the change calls for them.

## Capture

- From the running app (`pnpm dev` prints the URL; the `run` skill, or the browser tools the harness has), on the current head.
- **Before** from `main`: a checkout of main, or production when it shows the same state. For a bug, the bug as it was.
- **After** for every state the change touches. Light and dark when colours or surfaces changed. Desktop and tablet widths only: the repo doesn't support phones (`AGENTS.md`).
- Crop to the part that changed, with enough around it to place it. No real student's name, email, course or files: use the test account.
- PNG, named for what it shows: `before.png`, `after-light.png`, `after-dark.png`, `after-retry.png`.

## Recording

A GIF, before and after, for a change that **moves**: a new flow or a changed one (more than one step: a mode, a dialog that leads somewhere, onboarding), an animation or transition, drag and drop, something that appears, updates or streams while the student watches. A still can't show these: the reviewer would have to run the branch to see them. Made without asking. The screenshots of each state still come with it when the screen also looks different; a change only in how something moves (a transition's style or speed) has the GIFs alone.

1. **A steps file** (`flow-<what>.mjs`, in the scratchpad) that does the flow the way a student would, on the test account; its header in `record-flow` shows the helpers. Where the feature has an E2E test of its main path, take its steps from there; otherwise `record-flow --look <out.png> <url> [steps.mjs]` shows the screen and lists what can be clicked, by role and name. Its `setup` export gets to where the flow starts and clears what's in the way: none of it is in the GIF. The account is the same one each run, so setup copes with either state (`dismiss` for a banner or a welcome that only some runs see) and removes what an earlier run made. A `caption` before each step names it in the student's words ("Open Practice", "Flip the card").
2. **Record** it from the repo's checkout:

   ```bash
   ~/.agents/pr-flow/record-flow after-<what>.gif flow-<what>.mjs <app URL> [--dark]
   ```

   The GIF is the whole window at 800 px wide; when what moves is a small part of it, `--crop x,y,w,h` (CSS pixels) to that part with room to place it. The app's own animations play at real speed while the steps are slowed: one under half a second gets `--fps 30` and a crop, or it shows in two frames.

   It drives a real browser through the steps, slowed down, with a cursor and a ring where it clicks, and prints the GIF's length and size. **Before** is the same steps file on the base's app (as in Capture), with only the steps the old screen has; a flow that's new has no before GIF, and its before screenshot is the screen it's reached from on the base. On a failed step it writes `<name>-failed.png`: fix the step, not the screenshot.
3. **Look** at it: the sheet of its frames and its last frame at full size, which record-flow writes beside it (`<name>-sheet.png`, `<name>-last.png`). Every step is in it, the moving part is visible, the cursor lands where it clicks, and nothing in it is a real student's.

Done when each flow's GIF is under 30 s and 10 MB (record-flow warns past either), and you've looked at it. Longer: split the flow into two GIFs.

## Comparison

A choice about what a student sees is shown, not described: one picture with the screen as it is beside each option that changes it. It goes in a decision card's question ([decision-card.md](decision-card.md)) and in a review comment ([github.md](github.md)).

- **Now** from the running app, as in Capture. On a teammate's PR under review, Now is the PR's head: its own after screenshot when that shows the part.
- **Each option** made for real and captured, then undone, when it's a small change (a label, a variant, one control swapped for another). Otherwise a mockup: HTML in the app's look (its theme variables, in Alicia `apps/web/app/globals.css`) captured with headless Chrome, its label ending "(mockup)".
- Every panel cropped to the same part of the screen, at the same width and theme. Labels name the options as the question does.
- A choice about something that moves is shown moving: a GIF per option, recorded as in Recording with `--crop x,y,w,h` to the part that differs and `--width 480`, one after another in the question.
- Joined with `~/.agents/pr-flow/compare-image <out.png> "Now=now.png" "Proposed=proposed.png"`. T3 Code shows a picture at most 480 px wide **and 480 px tall**, shrinking a taller one until nothing in it can be read. So crop each panel to the part that differs (the new section of a dialog, not the whole dialog around it), one state an option; another state worth seeing is a second picture. compare-image warns when its picture won't fit.

Done when the picture reads at 480 × 480 px: compare-image gives no warning, and you open it and look.

## Upload

```bash
~/.agents/pr-flow/upload-screenshots <ali-id>-<slug> <file.png|file.gif>...
```

Run it from the repo's checkout. It adds the files to the orphan branch `assets/<ali-id>-<slug>` (the repo's convention, one branch a PR), keeps what's already there, overwrites a file of the same name, and prints one raw URL a file. Use those URLs in the PR body's tables ([pr-body.md](pr-body.md)), at `width="400"` when two sit side by side. A GIF goes in the same way: GitHub plays a GIF from a link, but a video only when it's uploaded through its website.

Done when every visible change has a before and an after in the PR body, each moving one its GIFs, and each file is on the branch (`gh api "repos/<o>/<r>/contents/<slug>/<file>?ref=assets/<slug>"` returns it; the repo is private, so a plain `curl` gets 404).

## Show them

The user reviews here before GitHub: the report that ends the skill which made them (report.md) shows each one inline, `![after: the flashcard flips](/absolute/path.gif)`, under a line saying what each shows: before, then after, one under the other (chat shows one picture a line; a pair of stills can be one picture with `compare-image`). Pictures taken again on a later round are shown again; ones unchanged since the user last saw them aren't.
