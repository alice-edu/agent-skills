# The Doop kit

A repo's **kit** is its real components on a Doop canvas of their own: each lifted from a Storybook story by `~/.agents/pr-flow/doop-kit` with its CSS, its variants as enum props, its text as props and its content areas as slots, linked to its file in code; the theme as the canvas's tokens, light and dark; its fonts in the Doop library. Sketches import their parts from it ([sketch-it](~/.agents/skills/sketch-it/SKILL.md)).

Each kit is listed in [me.md](me.md), "Doop kits": its canvas and its **spec**, the JSON that says which stories make which components (`doop-kit`'s header documents it). The spec and what `doop-kit` writes are the repo's own design: they stay out of this public repo.

Doop has no API for a script, so `doop-kit` writes the input of Doop's MCP tools, and an agent sends it: one `create_component` (or `update_component`) per part, its fields copied as they are. A whole kit is about 30 calls: hand them to agents in parallel, a third each, told to copy `html` and `css` verbatim and to report Doop's notes.

Run `doop-kit` from a checkout of the repo's base branch (`git worktree add --detach <scratchpad>/kit-main origin/main`, installed), with its Storybook running (`PORT=<free> pnpm storybook --ci --no-open` in `apps/web`). Close both when done.

## Before a sketch

1. The kit's canvas exists (me.md); without one, make it ("Make a kit").
2. For each part the options will use: `get_component_preview` beside `story-shot` of its story. One that differs (the app changed since) is rebuilt: `doop-kit build <spec> <url> <out> <Name>`, sent with `update_component`.
3. A part the app has and the kit doesn't: "Add a part".

## Make a kit

1. `create_canvas` `<Repo> UI`, and add it to me.md's "Doop kits" with the spec's path.
2. `create_tokens` with `doop-kit tokens <spec>`.
3. Each font file the theme uses (Alicia: `apps/web/fonts/*.woff2`): `upload_font` with `local_file: true`, then the `curl -T` it gives. A family already in the library is skipped (`get_canvas` lists `fonts`).
4. `doop-kit build <spec> <url> <out>`, every part sent as above.
5. `get_component_preview` of each part, beside its story's `story-shot`. It draws the first 12 combinations of its props and takes none: a value past those is checked in a test frame.

## Add a part

1. Find the story that draws it: `story-shot --list <url> <words>`. A part inside a bigger story is reached with `select` (a CSS selector from the story's root; prefer `data-slot` and other data attributes to class names).
2. Add it to the spec: `name`, a `description` that says when to use it (the next agent picks by it), `code` (its file and export).
   - **Variants**: `props`, one story per value. A value drawn inside another story is `{ "story", "select" }`.
   - **Text** an instance changes: `bind`, `"label": "text:<its text in the story>"` or a selector; attributes as `"href:icon"`, `"placeholder:placeholder"`.
   - **Content** an instance supplies (a card's body, an icon): `slots`.
   - `drop` for the story's scaffolding; `css` for what its context gave it (a row's hairline off on the first row).
   - A state that adds elements (ticked, on) is a part of its own (`Checkbox`, `CheckboxTicked`): props only change classes.
3. Build it alone, send it, and check its preview against its story.

## When a part draws wrong

Compare `get_component` with the story in the browser. What's been seen:

- **Half styled, all variants alike, or icons at 24 px**: Doop stopped reading the part's CSS at a selector it can't parse, or dropped one it couldn't match, without a note. `get_component` shows where the stored CSS ends. `doop-kit` renames each Tailwind class with brackets or escapes to a plain `tw-…` name in both HTML and CSS for this; a selector still escaped in the build is the culprit.
- **Unstyled**: its rules were dropped. A selector `doop-kit` didn't expect (a new state or variant syntax) fails its match: add it to `bare()` in `doop-kit`.
- **Touch layout** (row actions always showing): Doop's renderer reports no hover; `cleanRules()` keeps `(hover: hover)` rules and drops `(hover: none)` ones.
- **Wrong in dark**: a rule reads `.dark` in a way other than `:is(.dark *)`; `cleanRules()` puts `[data-doop-theme="dark"]` beside each form it knows.
- **Variant leaks into another, or a size is missing**: a class goes to the prop whose values say where it appears, and a story that doesn't say which value of another prop it shows (its root has no `data-<prop>`) counts as that prop's default. A story showing another value (the ghost icon button in a card, at `icon-sm`) needs `"at": { "size": "icon-sm" }`. Or `select` the story's own instance.
- **Paragraph gaps missing**: `bare()` must replace a whole `:not(...)` with `:is(*)` before relaxing its inner states. Removing it leaves a bare combinator; relaxing only its contents makes `:not(:is(*))` match nothing. Check the stored CSS still contains the original `:not(:last-child)` spacing rule.
- **Wrong font**: a font var the components read isn't in the spec's `fonts`.

Fix `doop-kit`, not the part by hand: the next build would undo a hand fix.
