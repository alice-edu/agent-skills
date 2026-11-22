---
name: excalidraw
description: 'Draw in Excalidraw so anyone with the link can read it: plain Nunito text, never the hand-drawn font; each colour named on the label it colours; a public view link. Use whenever you create, edit or share an Excalidraw scene (a diagram, chart, table, board or slide), and from diagrams.md.'
---

# Excalidraw

Every scene you draw is read cold, by the user and by whoever they send the link to. Three things make that work, and each is checked before the scene is handed over: **plain text**, **meaning on the labels**, a **public link**. What to draw and when (a flow, a data model, before and after) is the caller's: for a PR's diagrams, [diagrams.md](~/.agents/pr-flow/diagrams.md).

## 1. Draw it plain

- Every generator call gets `style: "clean"` (`create_diagram`, `create_mermaid_diagram`, and any other tool that takes a `style`): straight strokes and Nunito text. The tools default to the hand-drawn look.
- Every element added by hand (`edit_scene_content`, a label patch) gets `fontFamily: 6` on its text and `roughness: 0` on its shape, whatever a `read_*_format` guide suggests.
- No personal data (names, emails, course content): the link is public (step 3).

## 2. Meaning on the thing itself

A colour, a dashed line or an arrowhead the reader has to guess at is noise. So:

- Colour only what means something; everything else stays neutral (`kind` default, Mermaid's `muted` or `colors: "none"`).
- Say the meaning where the eye already is: in the arrow's or box's own label, a mark and a few words ("✓ right app", "✗ wrong app", "only on retry"). The colour then repeats what the label says, so the diagram reads in grey too.
- A legend only when one meaning repeats on many elements and labelling each would crowd it: a sample of the thing itself (a short green arrow, a red box) beside one to three words, inside the same screenshot. Never a box of sentences describing colours.
- A diagram whose labels say it all has no legend.

## 3. Make it public

`share_scene` with `access: "view"` on every scene you create, then hand out the link it returns (`https://link.excalidraw.com/l/…`), never the `app.excalidraw.com` one, which only the workspace can open. A scene shared earlier keeps its access: pass the one it has (`get_scene`'s `linkSharing`: 1 view, 3 edit) so an edit link isn't turned into a view link.

## 4. Check it

1. `get_scene_content`: every text element has `fontFamily: 6`. Set any other to 6 with `edit_scene_content`, including labels bound to shapes and arrows.
2. `take_screenshot` (or `screenshot: true` on the write): the labels read, nothing overlaps, the arrows go the way they should, and every colour and line style says its meaning on its own label (or, when it repeats, in a sample legend). Fix with `edit_scene_content` on the returned ids, then check the fonts again.
3. `get_scene`: `linkSharing` isn't `0`.

Done when all three hold. Then give the public link, with the screenshot where the reader needs to see it without opening the link.
