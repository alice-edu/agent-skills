# Diagrams

A diagram lets the user see a change's shape before they read its code: in `review-pr` to review it, in `build-it` to agree a design before it's built. It goes in Excalidraw, where they can open it, move things and draw on it.

## When

One diagram too many beats one too few: when in doubt, draw it. Draw one for a change, a review row or a question that:

- **adds or changes a flow**: what calls what, a request's way through client, mutation, workflow and scheduler, the steps a student goes through;
- **changes the data model**: a table or field added or moved, where something is stored or read from, a copy that becomes a reference or back;
- **turns on order or timing**: a race, a retry, a step that now runs before another, two things swapping at once, something read before it's written;
- **changes a cost**: reads, writes or jobs queued, before and after, with the counts (one job per student → one per batch of 100);
- **adds or changes states**: a status and what moves it on, a state machine;
- **changes who can see or do what**: access, sharing, roles;
- **reshapes one thing from two sides**: a merge where both branches changed it (each side, then the result);
- **puts one of these to the user**: a decision card's question, or a push back or skip on a reviewer's point, that turns on a flow, the data, an order, a cost, states or access. The diagram is what lets them decide it cold. A question about wording or a look gets a screenshot instead.

Skip it only where nothing above matches and there's no shape to draw: wording, a style, a rename, a missing test or story file. A match above wins over a short fix: a one-line change to a race or to who can see what still gets its diagram.

A skill that explains a change or a review to the user goes through what it's showing against this list before it shows it, and draws one for each match. Several matches about the same thing share one diagram.

## What

- One topology a diagram: a flow, or a data model, or a state machine. Two of them are two diagrams in the same scene.
- Before and after side by side when something existing changes, the changed edges coloured (`success`, `warning`, `failure` by outcome).
- The code's real function, table and file names, short (under 30 characters a node).
- Titled with what it shows, plus the PR number and short head SHA once there is one: `PR #723 @ 5f4201d: question writing, before and after`.
- No student data: names, emails, course content.

## How, in Excalidraw

1. `list_collections`; the scene goes in the one with `isDefault: true`.
2. `create_scene` with the title as its `name` and `pinned: false`. On a re-review or a redesign, reuse the thread's scene and redraw with `clearExisting` only when the structure changed.
3. `read_diagram_format` once a run, then `create_diagram` with semantic nodes and edges and `style: "clean"` (straight strokes). For several diagrams in one scene, give each its own `x` and `y` so they sit side by side.
4. Check every text is Nunito (`fontFamily: 6`), Excalidraw's plain font, never the hand-drawn Excalifont (5), which the user finds hard to read. `clean` writes Nunito; check it anyway with `get_scene_content`, and set `fontFamily: 6` with `edit_scene_content` on any text that isn't, including labels bound to shapes and arrows. Done when no text element has any other `fontFamily`. Anything added by hand later gets `fontFamily: 6` and `roughness: 0` too, whatever `read_diagram_format` suggests.
5. `take_screenshot`, and look: labels readable, nothing overlapping, the arrows reading the intended way. Fix with `edit_scene_content` on the returned element ids, then check the font again.
6. Make it public, so a teammate opens it from the PR without being in the user's workspace: `share_scene` with `access: "view"`. It returns the public link (`https://link.excalidraw.com/l/…`); use that one. `get_scene` then shows `linkSharing` no longer `0`.
7. Put it where people read about the change:
   - the Links line (links.md), and beside the diagram's screenshot in the report;
   - the PR's own body for the user's PR (pr-body.md, "Diagram"), and the GitHub review for someone else's (`review-pr`);
   - its screenshot there too, when the diagram reads at PR width (a few boxes, labels legible at 800 px): save the `take_screenshot` image as `diagram-<what>.png` and upload it with the PR's screenshots (screenshots.md, "Upload"). A big one gets the link alone.

Done when the screenshot reads cleanly, link sharing is on, and it's on the Links line and in the PR or the review.

Codex finds the Excalidraw tools through tool search. When they're missing or a call is refused, draw it as Mermaid instead (in T3 Code, `html_preview` then `html_render`) and say which step failed, so the user can fix the connection. A Mermaid diagram has no link: show it with the design or the report and leave it off the Links line. Done when it renders readably.
