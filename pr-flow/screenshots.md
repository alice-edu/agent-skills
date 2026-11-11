# Screenshots

For any change a student can see: rendered UI, copy, layout, styling, an interaction state. A refactor whose screen is identical needs none.

## Capture

- From the running app (`pnpm dev` prints the URL; the `run` skill, or the browser tools the harness has), on the current head.
- **Before** from `main`: a checkout of main, or production when it shows the same state. For a bug, the bug as it was.
- **After** for every state the change touches. Light and dark when colours or surfaces changed. Desktop and tablet widths only: the repo doesn't support phones (`AGENTS.md`).
- Crop to the part that changed, with enough around it to place it. No real student's name, email, course or files: use the test account.
- PNG, named for what it shows: `before.png`, `after-light.png`, `after-dark.png`, `after-retry.png`.

## Comparison

A choice about what a student sees is shown, not described: one picture with the screen as it is beside each option that changes it. It goes in a decision card's question ([decision-card.md](decision-card.md)) and in a review comment ([github.md](github.md)).

- **Now** from the running app, as in Capture. On a teammate's PR under review, Now is the PR's head: its own after screenshot when that shows the part.
- **Each option** made for real and captured, then undone, when it's a small change (a label, a variant, one control swapped for another). Otherwise a mockup: HTML in the app's look (its theme variables, in Alicia `apps/web/app/globals.css`) captured with headless Chrome, its label ending "(mockup)".
- Every panel cropped to the same part of the screen, at the same width and theme. Labels name the options as the question does.
- Joined with `~/.agents/pr-flow/compare-image <out.png> "Now=now.png" "Proposed=proposed.png"`. T3 Code shows a picture at most 480 px wide **and 480 px tall**, shrinking a taller one until nothing in it can be read. So crop each panel to the part that differs (the new section of a dialog, not the whole dialog around it), one state an option; another state worth seeing is a second picture. compare-image warns when its picture won't fit.

Done when the picture reads at 480 × 480 px: compare-image gives no warning, and you open it and look.

## Upload

```bash
~/.agents/pr-flow/upload-screenshots <ali-id>-<slug> <file.png>...
```

Run it from the repo's checkout. It adds the files to the orphan branch `assets/<ali-id>-<slug>` (the repo's convention, one branch a PR), keeps what's already there, overwrites a file of the same name, and prints one raw URL a file. Use those URLs in the PR body's tables ([pr-body.md](pr-body.md)), at `width="400"` when two sit side by side.

Done when every visible change has a before and an after in the PR body, and each file is on the branch (`gh api "repos/<o>/<r>/contents/<slug>/<file>?ref=assets/<slug>"` returns it; the repo is private, so a plain `curl` gets 404).
