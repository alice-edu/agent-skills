---
name: sketch-it
description: Settle a UI change in Paper before any code: rounds of side-by-side variants built from the app's real parts, each with a recommended pick, until the design is agreed and every state is drawn. Use when the user says "sketch it", or picks a sketch on build-it's card.
---

# Sketch it

A design review in rounds, answered with artboards instead of words. Each round puts today's screen beside two or three variants, built from the app's own parts, and asks one question with a recommended answer. It ends with a design the user picked, drawn in every state, and a short spec `build-it` builds from. It writes no app code.

Every variant is judged by the [`usability`](~/.agents/skills/usability/SKILL.md) principles before the user sees it, and a recommendation names the one it serves.

## 1. Pin down what we're sketching

One sentence: what the student is trying to do, on which screen, and what's wrong or missing now, with its source (the user's words, the Linear issue, the thread). Read the repo's `AGENTS.md` sections for that screen (in Alicia: Components, Where state goes, Panel headers, Row menus, The tour).

Done when the sentence is written and you know which screens and states the change touches.

## 2. Set up the page

- **The file**: the team's design file (in Alicia, the Paper file named "Alicia"). A page for this sketch, named like the others there: `<what it is> (ALI-123)`, or `<what it is>` when there's no issue, with the `design` icon. One that already exists for the issue is reused.
- **The parts**: the Parts page (`sync-paper`). Its `Synced` stamp names the commit it matches. When the stamp names none ("Partly synced", or no stamp), or the components or theme changed since that commit on the default branch (`git log <commit>..origin/<default> -- <components> <theme css>`), run `sync-paper` first.
- **Today's screen**, when the change touches one that exists: capture it from the running app on the thread's head, at desktop width, in each state the change touches:

  ```sh
  node ~/.agents/skills/sync-paper/scripts/to-paper.mjs page --url <app url> --name "Now · <state>" --file <fileId> --page <pageId> [--selector <css>] [--replace]
  ```

  A screen behind sign-in needs a session: save one with `npx playwright open --save-storage=<file> <app url>` in the script's folder (sign in, or let the app do it, then close the window) and pass `--storage-state <file>`. Phones aren't supported yet: no phone sizes.

Done when the page exists and holds today's screen in each touched state, or the change is wholly new and the Parts page is current.

## 3. Rounds

Map the design's decisions first (what goes where, what it says, what's shown when, what moves behind "advanced"), and which hang off which. Each round takes the **frontier**: the decisions whose earlier decisions are settled. One or two per round.

For each decision on the frontier:

1. **Build the variants**: two or three, in a row beside "Now", named `Round <n> · <A/B/C> · <its trade-off>`. Build each by duplicating "Now" and the Parts page's artboards (`duplicate_nodes`, `<x-paper-clone>`), then changing them (`update_styles`, `set_text_content`, `write_html` with the file's tokens). A part the app doesn't have yet is drawn in the theme's tokens and its layer named `new · <what>`. Real text, in the app's voice: never lorem ipsum.
2. **Judge them**: each against the usability principles, in order. A variant that fails one is fixed or dropped before it's shown. `get_screenshot` each and look.
3. **Ask**: in chat, numbered so "1B, 2A" answers, each with the recommended variant first and why in a line, naming the principle: "**1. Where the filter goes**: B, in the panel's bar (self-evident: it sits on what it filters). A keeps it in the menu: tidier, but hidden."

Answers come in chat, or on the canvas: before each round, read the page (`get_screenshot` of what changed, `list_comment_threads`). An edit the user made is their answer; a comment is a question or a request. Resolve each comment thread once its round settles it (`set_comment_thread_status`).

Done with the rounds when no decision is left open and the user has agreed to the whole design, not only the last round.

## 4. Draw it whole

The agreed design in a final row, `Final · <state>`: every state it has (empty, filled, loading, error, long text, and dark when colours changed). Check each against the principles and the basics in `usability` once more. Then `finish_working_on_nodes`.

Done when every state the change has is an artboard in the Final row.

## 5. Hand it to build-it

Write the spec, short enough to read in a minute:

- what changes for the student, in a sentence;
- each part and what draws it: an existing component by name, or **new**, with what it is;
- each state and what it shows;
- the text it needs (for the translation files), and the decisions made in the rounds, one line each.

Put it on the Linear issue as a comment with the Paper page's link. With no issue, `linear-track` makes one when the work is going on to a PR (it's run from `build-it`, or the user says *build it*); otherwise the spec lives in chat and on the page, as a text artboard named `Spec` beside the Final row. Give the link in chat either way.

The builder reads the Final row from Paper, not from the screenshot: `get_jsx` for structure and text, `get_computed_styles` for exact values. Layers named `new · <what>` are the parts to build; everything else maps to the component the spec names.

Run from `build-it`'s card: go back to its step 6, which builds from the Final row and this spec. Run on its own: end with "say *build it*".

Done when the spec is on the issue (or the page) and the link is in chat.
