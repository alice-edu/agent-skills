---
name: sync-paper
description: Copy the app's parts from its Storybook into the team's Paper file, so sketches start from what the app really draws. Use when the user says "sync Paper", and from sketch-it when the parts are behind.
---

# Sync Paper

Keeps a **Parts** page in the team's Paper file in step with what's merged: every Storybook story as an artboard named `<title> / <story>`, measured in a real browser and rebuilt as editable layers by [`scripts/to-paper.mjs`](scripts/to-paper.mjs), and the theme's colours and radius as Paper tokens, which the artboards' colours are bound to. A sketch duplicates these instead of drawing parts from memory.

The script rewrites only the artboards whose render changed. It keeps each story's fingerprint on the page's **stamp**, an artboard named `Synced`. The stamp names a commit only after a full run with no failures; otherwise it says "Partly synced". With `--changed`, it renders only the stories that the files changed since that commit can reach, as Chromatic's TurboSnap does: a few seconds when nothing changed, and everything when a global file (`.storybook/`, `public/`, a `package.json` or lockfile) changed.

## 1. Get the pieces running

- **Paper Desktop** open, with its MCP tools (the `paper-desktop` plugin) loaded. Read Paper's guide once (`get_guide`, "paper-mcp-instructions"). No Paper tools: stop and tell the user to install Paper Desktop and its plugin, then restart the session.
- **The script's browser**: `npm install` in this skill's `scripts/` folder (the installer does it). When it says Chromium is missing: `npx playwright install chromium` there.
- **Storybook, from exactly `origin`'s default branch**, whichever checkout you start in (the script refuses anything else unless `--only`; a sketch for a branch that changes parts captures them from its own screens). `git fetch origin`. When this checkout is at it with no changes, use it. Otherwise make one in your scratchpad for the run: `git worktree add --detach <dir> origin/<default branch>`, install its dependencies the repo's way (in Alicia, `pnpm install --frozen-lockfile --prefer-offline`, about 15s), and start its Storybook on a free port (in Alicia, `PORT=<port> pnpm --filter @alicia/web storybook`, at `http://localhost:<port>`). Elsewhere, find how to run it in the repo's `AGENTS.md`, then the app's README, then the `storybook` script in its `package.json`. A repo with no Storybook: stop and say so; Storybook comes first. Check `<storybook url>/index.json` answers.
- **The file**: the team's design file, found with `list_resources` (in Alicia, the Paper file named "Alicia"). No match or several: ask the user which, with the list. Its **Parts** page is named `Parts · from Storybook` with the `swatches` icon, first in the page list (`arrange_pages`). Create it the first time.

Done when `index.json` lists stories from `origin`'s default branch and you have the file's and the Parts page's ids.

## 2. Capture

```sh
node scripts/to-paper.mjs storybook --base <storybook url> --file <fileId> --page <partsPageId> --prune \
  --changed <checkout>/<storybook project dir> [--only "<title>,<title>"]
```

`--changed` is the checkout Storybook runs from: the script checks it against `origin`, takes the stamp's commit from it, and renders only the stories its changes reach. Everything, unless the user named parts ("sync Paper, just the buttons"): then `--only` those titles. One row per component, its stories left to right, laid out afresh in the index's order each run, so an artboard that changed size moves its neighbours rather than leaving a gap. Each artboard is framed by what its story draws: an open dialog or sheet without the page behind it, a menu with its trigger. A changed artboard is replaced, and `--prune` removes the artboards of stories that are gone. `--force` renders and rewrites every artboard, for after a change to the script itself. Stories render 4 tabs at a time (`--jobs`). An artboard that comes out far larger than its part is a capture bug: fix the script, not the story.

Light only, unless the user asks for dark too. Then run it again with `--globals <theme global>:dark --suffix " · dark"`, using the theme global's name from Storybook's `preview` config. The dark rows go below the light ones, with their own stamp, `Synced · dark`.

The light run also syncs the tokens, printed as its `tokens:` line: each colour and radius the app's `:root` declares is a Paper token of the same name (`--primary`, `--radius`), and one it made that the CSS dropped is deleted. Tokens it didn't make are left alone. An artboard's colour is written as `var(--token)` where the element's own class names that token and the value matches, so editing a token in Paper repaints the parts, and new parts in a sketch use the same names. Dark rows keep literal colours: tokens hold the light theme.

When you made a checkout for the run, stop its Storybook and `git worktree remove` it.

Done when the script exits cleanly and any checkout made for it is removed. A story it prints as `FAILED` didn't render: open it in Storybook, fix the story (or tag it `no-paper` when it can't render alone), and run again.

## 3. Check it

Pick three artboards: a simple one, the busiest one, and one with a menu or dialog open. Compare each one's `get_screenshot` with the same story in Storybook. A difference in layout, font, colour or text is a bug in the capture. Fix `to-paper.mjs` (its header lists what it doesn't copy) and run again with `--force --only` on those stories.

Done when the three match.

## 4. Report

Report the script's `tokens:` line, its last line (made, replaced, unchanged, removed, failed) and the stamp's line. Add anything that didn't copy well and why, and the Parts page's link (from `get_basic_info`). Then `finish_working_on_nodes`.

Done when the report is sent.
