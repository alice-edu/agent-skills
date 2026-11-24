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
- **puts one of these to the user**: a decision card's question, or a push back or skip on a reviewer's point, that turns on a flow, the data, an order, a cost, states or access. The diagram is what lets them decide it cold. A question about wording or a look gets a comparison picture instead (screenshots.md, "Comparison").

Skip it only where nothing above matches and there's no shape to draw: wording, a style, a rename, a missing test or story file. A match above wins over a short fix: a one-line change to a race or to who can see what still gets its diagram. A small change (ready.md, "A small change") can't touch those, so it gets none unless a card's question needs one.

A skill that explains a change or a review to the user goes through what it's showing against this list before it shows it, and draws one for each match. Several matches about the same thing share one diagram.

## What

- One topology a diagram: a flow, or a data model, or a state machine. Two of them are two diagrams in the same scene.
- Before and after side by side when something existing changes, the changed edges coloured (`success`, `warning`, `failure` by outcome), each edge's label saying its outcome ("✓ right app", "✗ wrong app").
- The code's real function, table and file names, short (under 30 characters a node).
- Titled with what it shows, plus the PR number and short head SHA once there is one: `PR #723 @ 5f4201d: question writing, before and after`.
- No student data: names, emails, course content.

## How, in Excalidraw

1. `list_collections`; the scene goes in the one with `isDefault: true`.
2. `create_scene` with the title as its `name` and `pinned: false`. On a re-review or a redesign, reuse the thread's scene and redraw with `clearExisting` only when the structure changed.
3. Draw it with the `excalidraw` skill: `create_diagram` with semantic nodes and edges, `style: "clean"`, Nunito text, each colour's meaning on its label, checked by screenshot, shared by public view link. For several diagrams in one scene, give each its own `x` and `y` so they sit side by side.
4. Put it where people read about the change:
   - the Links line (links.md), and beside the diagram's screenshot in the report;
   - the PR's own body for the user's PR (pr-body.md, "Diagram"), and the GitHub review for someone else's (`review-pr`);
   - its screenshot there too, when the diagram reads at PR width (a few boxes, labels legible at 800 px): save the `take_screenshot` image under `shot-name`'s name for `diagram-<what>.png` and upload it with the PR's screenshots (screenshots.md, "Upload"). A big one gets the link alone.

Done when the `excalidraw` skill's checks hold, and the link is on the Links line and in the PR or the review.

## On a card

A decision card's question shows its diagram, not only its link: the user decides from the picture in the question box, which T3 Code shows at most 480 px wide. So it's a small diagram of its own, beside the change's full one:

- Drawn by the `excalidraw` skill (clean, meaning on the labels, public). One row for each option, left to right, stacked: `create_mermaid_diagram` with `style: "clean"` and `flowchart TB`, a `direction LR` subgraph a row, joined by `~~~`. Each row named as the card names its option ("Keep (this PR): per page", "The reviewer's ask: whole course"), the recommended one first. At most four nodes a row: only the part the question turns on.
- The edge that differs coloured in every row (`linkStyle`: green for the recommended, red where it goes wrong), its label saying what differs: the count, the index, which runs first.
- Each row drawn from the code it stands for (the diff, or the planned change read against the files it touches).
- `take_screenshot` with the subgraphs' `elementIds` at full size (no `maxWidth` below 960, or it's blurred at 480 px), saved as a PNG under `shot-name`'s name (a redrawn one under a new one), and put in the question as `![<row>: the options](/absolute/path.png)`, the public link on the line under it.

Done when the PNG, opened, reads at 480 px wide: every label legible.

Codex finds the Excalidraw tools through tool search. When they're missing or a call is refused, draw it as Mermaid instead (in T3 Code, `html_preview` then `html_render`), with the same plain font and labels and say which step failed, so the user can fix the connection. A Mermaid diagram has no link: show it with the design or the report and leave it off the Links line. Done when it renders readably.
