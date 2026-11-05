# Diagrams

A diagram lets the user see a change's shape before they read its code: in `review-pr` to review it, in `build-it` to agree a design before it's built. It goes in Excalidraw, where they can open it, move things and draw on it.

## When

Draw one when the change is hard to follow in prose: an ordering, a state machine, a flow across client, mutation, workflow and scheduler, or a change to the data model. Skip it for a UI-only change, one file, or a rename.

## What

- One topology a diagram: a flow, or a data model, or a state machine. Two of them are two diagrams in the same scene.
- Before and after side by side when something existing changes, the changed edges coloured (`success`, `warning`, `failure` by outcome).
- The code's real function, table and file names, short (under 30 characters a node).
- Titled with what it shows, plus the PR number and short head SHA once there is one: `PR #723 @ 5f4201d: question writing, before and after`.
- No student data: names, emails, course content.

## How, in Excalidraw

1. `list_collections`; the scene goes in the one with `isDefault: true`.
2. `create_scene` with the title as its `name` and `pinned: false`. On a re-review or a redesign, reuse the thread's scene and redraw with `clearExisting` only when the structure changed.
3. `read_diagram_format` once a run, then `create_diagram` with semantic nodes and edges and `style: "clean"` (straight strokes). Give it `fontFamily: 6` if it takes one.
4. Make every text Nunito (`fontFamily: 6`), Excalidraw's plain font: `clean` still writes the hand-drawn Excalifont, which the user finds hard to read. `get_scene_content`, then one `edit_scene_content` whose `update` sets `fontFamily: 6` on every text element, including the labels bound to shapes and arrows. Read the scene back: done when no text element has any other `fontFamily`. Anything added by hand later gets `fontFamily: 6` and `roughness: 0` too, whatever `read_diagram_format` suggests.
5. `take_screenshot`, and look: labels readable, nothing overlapping, the arrows reading the intended way. Fix with `edit_scene_content` on the returned element ids, then check the font again.
6. Make it public, so a teammate opens it from the PR without being in the user's workspace: `update_scene` turning on link sharing (view only), then `get_scene` and check that `linkSharing` is no longer `0`. The link is the read-only one in `readOnlyLinks` when there is one, otherwise `https://app.excalidraw.com/s/<workspace>/<scene id>` (both from the scene's `metadata`).
7. Put it where people read about the change:
   - the Links line (links.md), and beside the diagram's screenshot in the report;
   - the PR's own body for the user's PR (pr-body.md, "Diagram"), and the GitHub review for someone else's (`review-pr`);
   - its screenshot there too, when the diagram reads at PR width (a few boxes, labels legible at 800 px): save the `take_screenshot` image as `diagram-<what>.png` and upload it with the PR's screenshots (screenshots.md, "Upload"). A big one gets the link alone.

Done when the screenshot reads cleanly, link sharing is on, and it's on the Links line and in the PR or the review.

Codex finds the Excalidraw tools through tool search. When they're missing or a call is refused, draw it as Mermaid instead (in T3 Code, `html_preview` then `html_render`) and say which step failed, so the user can fix the connection. A Mermaid diagram has no link: show it with the design or the report and leave it off the Links line. Done when it renders readably.
