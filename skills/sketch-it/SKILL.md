---
name: sketch-it
description: 'Design a screen, component, flow, panel or landing section with the user in rounds of sketches on a Doop canvas, made from the app''s real components, after references from Mobbin and a usability pass, until the user says agreed. Use when the user says "sketch it", from build-it for a new screen, flow or panel, and from review-pr for alternatives to a teammate''s screen.'
---

# Sketch it

A **sketch** is the real thing drawn early, on a Doop canvas: frames composed from **copies** of the app's own components, each taken on demand from the story that draws it in its Storybook (`~/.agents/pr-flow/story-shot --inline`: the story's drawing with each element's computed styles written on it). Only the layout between parts is written by hand, so what's agreed is what gets built, and each part names the story and file it's copied from.

Each **round** is a **row** on the canvas: **Before** (the screen now), then at most three options, each an **own idea** unless a reference clearly shows it, and checked for usability before the user sees it, then the references they borrow from. Over each design sits its **note**, a frame of its own; the recommended option's note is outlined in orange. The user comments on the canvas and types **next** in chat; the next round is a new row below. It ends when the user says **agreed**.

What's sketched sets the row's shape (step 4): a **screen**, a **component** (its variants and states), or a **flow** (a **lane** of screens in step order).

Nothing is committed, pushed or posted, apart from the Doop canvas.

## From a review

Started from review-pr, the sketch questions a teammate's screen, so three things change:

- **Before** is the PR's head: the brief is the UI and UX lens's finding, and Storybook runs on a checkout of the PR's head, not the base.
- **PR parts**: a part the PR adds may never merge. Options copy it from the PR's stories like any other, labelled **PR part**.
- **Hand over** goes to the user only: no ready-for-dev mark, no build. The report ends asking whether the sketch's page goes in the review, as an optional comment.

## Copies

A **copy** is `~/.agents/pr-flow/story-shot <out.png> <storybook url> <story id> --width <w> --inline <out.html>`: the story's drawing alone, its styles inline and classes dropped, plus a picture to check it against. `--dark` makes the dark copy. It lists the fonts and images it needs; each goes on the canvas once (`upload_font`, `upload_asset`) and its URL is swapped into the copy. Run it from a checkout of the base branch, installed, with its Storybook running (`PORT=<free> pnpm storybook --ci --no-open` in `apps/web`), and close both when done.

A copy is pasted into a frame as it is and never restyled: a part that should look different is a **new part**. A copy that draws unlike its picture is `story-shot`'s to fix, never fixed by hand in the frame.

## A phone screen

The phone app (in Alicia, `apps/mobile`) is copied the same way from its own Storybook (`pnpm storybook:mobile`), with these differences:

- Copies are made at `--width 390 --height 844`, and frames are 390 × 844. A story's `screen`, `edge` and `fill` parameters say how it sits on the phone.
- **What a copy can't show**: it's the browser's drawing, not the phone's. Glass has no blur behind it, a sheet or modal is drawn open with no slide, and nothing responds to a gesture. Say so under a frame where that's the question; the finished look is judged on the devices ([ready.md](~/.agents/pr-flow/ready.md), "Proof").

## 1. Frame it

1. **What's sketched**: the screen, flow, panel or section, the problem the user wants solved in a line, and the **state** the problem lives in (a new chat, a course under way, a long name). From build-it, the issue says it.
2. **The mode**, by where it lives:
   - **Product** (the app's screens): **copies** of the app's parts only. A piece the app doesn't have is drawn from the theme's values (`apps/web/app/globals.css`, light and `.dark`) and labelled **new part**: adding one is the user's call.
   - **Marketing** (in Alicia, the landing `apps/web/app/(app)/(entry)/login/landing/` and the blog): free layout and pieces of its own, on the brand's colours and fonts, after the landing's own sections. No new-part labels.
   - Neither clearly (the login form, an email): ask on the first round's card.
3. **Storybook is running** from a checkout of the base branch ("Copies").
4. **Before**, in that state: a copy of the story that draws it (`story-shot --list <url> <words>` searches by component name: `actions`, not "Study panel"). Read the wrapper that renders the view in the app (`Actions` for `ActionsView`) for props its stories leave out: those are often the state. No story draws it in that state: write one, `<Name>.sketch.stories.tsx` beside the view, uncommitted, with Storybook on the thread's checkout instead.
5. **Check the brief against the picture.** Where the user's words don't match what's on screen ("a wall of tiles" over a list of rows), say so on the card, and sketch for the problem behind the words.

Done when you can say in one line what's sketched, in which state and mode, and have Before's copy.

## 2. References

A reference earns its place by what an option **borrows** from it: a part, an order, a way of grouping, that the option wouldn't have without it. A reference found to back up an option already decided borrows nothing, and goes.

**Own idea** is the default: most options have no reference, and that's a finished option, not a gap. A reference is the exception, kept only on a **clear match**: a screen from a well-known, well-made app, ideally in a nearby domain (learning, notes, productivity), that solves the same problem for the same kind of user, where the borrowed part is visible in the screenshot itself. A screen that only shares a word, a look or a layout with the option is no match; neither is what every app does (one main button, a quiet way out, a back arrow, sign up or log in).

Search Mobbin (its `search_screens`, `search_flows` for a flow, or `search_sections` for a landing section; platform `web`, or `ios` for a phone screen) **once a round, before drawing any option**, by the problem, as specifically as it can be said: "results screen, extra study material for only what you missed", not "lesson complete screen". Write each query from the problem, never from how the screen looks now ("card with a bar") or from an option already drawn ("removable chips with clear all"). Two or three queries from different angles, each run once. Look at what each result does about the problem before keeping it.

At most one reference an option; a round with none is normal. When the search finds no clear match, the notes say `No clear match on Mobbin` and the options stand as own ideas.

Each reference kept is a **reference frame** at the end of its row (step 4), so the user compares without leaving Doop: the whole screenshot at a size that reads (`upload_asset` from its image URL), an orange box (`#e5683a`) on exactly the part borrowed, and under it the borrow in one line, `A takes <what> from it`, with its `mobbin_url`. For a flow, the two or three screens of its flow that show it, side by side. Decide the box when you upload, from the screenshot you have: a reference is drawn once.

Done when every reference kept is a clear match with its borrow line naming an option and the boxed part, and every other option is marked an own idea.

## 3. The canvas

Read Doop's guide once (`get_guide`). Its brief, inspiration and image steps are for designs from scratch: here the app's copies are the brief.

1. **One canvas per sketch**, `Sketch: <what>`, made once; a new thing sketched on it gets a page of its own (`create_canvas_page`). On a new one, upload the fonts and images the copies list ("Copies"); a later round uploads what it adds. No tokens and no components: the copies carry their own styles.
2. **A banner** across the top of the page, a frame of a few lines: what's sketched, how to read the rows (a strip marked `same as Before` is unchanged, `NEW` is new or changed, orange is recommended), and "comment, then type next in chat".
3. **The first row**, under the banner: a label frame `Round 1: <the problem in a few words>`, then Before as a copy (step 1) at the width it was made at, named `Before`, with its note over it.

Done when the canvas has the fonts and images, and a page with the banner and Before.

## 4. Sketch

Each option is a frame beside Before, named `A: <idea>`, `B: …`, at most three, at the same width, 80 px apart, its height fitted to what it holds, with its note above it. A row holds, left to right: Before, the options, then the reference frames.

- **Notes** are their own frames, never written into a design: the option's name and idea, then a few short lines: what changes, its usability verdict (step 5), its cost to build, and what it borrows from which reference, with its link, or "own idea". Every note in a row is one height. The recommended option's note has a 3 px orange border (`#e5683a`), a pale orange fill (`#fff6f1`) and a `★ Recommended` badge; the others a dashed grey border on off-white.
- **One template a round**: write the note and the frame's wrapper once and fill them in for each option, so a row is drawn in a few calls and its frames line up.
- **Before carries over**: from round 2, Before is the earlier round's frame unchanged, so its note says `Same as Round <n> ↑` and the frame isn't drawn again. A flow's Before lane is the exception: it's drawn again in every round, so each round reads on its own.

By what's sketched:

- **A screen**: each option the whole screen (1280 wide on the web, 390 × 844 on the phone).
- **A component**: each option one frame holding the component's variants and states side by side (default, hover, disabled, loading, at each size the app uses), labelled, so a change shows on every state at once.
- **A flow**: each option is a **lane**, a row of its own: the note at the left, then its screens in step order, each topped by a label strip (`3 · Level →`). Every lane shows every step at full strength, so each lane reads as the whole flow; what's the same as Before is marked outside the screen, on its label strip (`3 · Level · same as Before`), and a new or changed screen's strip carries an orange `NEW` badge. Nothing is faded, covered or left out. Carried-over screens are their story's picture (`story-shot`'s png), not copies: nothing on them is being designed. A new screen over an existing one (a sheet, a dialog) is drawn over its picture, dimmed behind.

- **Parts** are copies ("Copies") of the stories that draw them, in the state and with the props the option needs: a story missing that state gets one, `<Name>.sketch.stories.tsx` beside the component, uncommitted, with Storybook on the thread's checkout. Each part's line names its story and the file it's built from.
- **Layout** between parts is plain HTML with inline styles, its values read off the copies and the theme (`apps/web/app/globals.css`): flex and grid, gaps and padding on the 4 px grid (16 px is the app's `p-4`), surfaces in the theme's colours, a panel's corners as the app's `rounded-xl` and a row's or control's as its `rounded-lg`, its shadows, text at the app's sizes (14 px body, 12 px labels).
- **Controls**: compare the options with Before for controls that are easy to lose while composing, including settings chips, group headings and overflow menus. Keep them unless changing them is the point of the option.
- **Data** is the fake data the app's stories use (`storyData.ts` in Alicia): the same course, files and names, so options compare with Before.
- **New text** in English, listed once a search of `packages/i18n/messages/en.json` shows no key says it already.
- **Dark**: when an option's colours are the question, a second frame of it, `A: <idea> (dark)`, built from the `--dark` copies and the theme's `.dark` values.

Look at each with `get_frame_screenshot` beside Before's, and fix what draws wrong before anyone sees it: a part that draws unlike its story's picture is `story-shot`'s to fix ("Copies").

Done when every option's frame draws without faults and every piece in it is a copy, a new part so labelled, or (marketing) the landing's own.

## 5. Usability

Read [usability](~/.agents/skills/usability/SKILL.md)'s principles and judge each option by them, its step 2 on the frame's screenshot, without its fixing step. A marketing option is judged as well on its claims: each one true to the sources the section cites, and fair to the products it names. A finding the option can fix within its own idea, fix in the frame and look again. What's left goes on the option's line: what a student (or visitor) would trip on, and the principle.

Done when every option has a verdict: clear, or its findings.

## 6. Show

The canvas is where the user reads the round, so chat stays short. `set_status` to `Ready: comment, then type next`, and reply in a few lines:

- the page's link (`/c/<canvas>`, and the page's name);
- each option in a line, the recommended first: its name and what it changes; where the brief and the screen differ, a line on that;
- the ask: comment on the canvas, then type **next**; or **agreed: <option>**.

Without Doop's tools, say so and stop: the sketch needs the canvas.

Done when every frame of the row has been looked at with `get_frame_screenshot` and the reply is sent.

## 7. Iterate

On **next**, read the canvas's comments (`get_comments`; an element comment's `elementId` is a `data-doop-id` in `get_frame`) and what was said in chat. A pick, a mix ("A's card with B's order"), or comments become the next round: a new row below the last, its label `Round <n>: <what changed>`, Before carried over, then the variants named `<picked><n>: <Idea>` (`A1: Quiet card`), each through steps 4–6. A reference already on the canvas is pointed at, not drawn again; a variant gets a new search only when the round's problem itself changed. Keep the user's words as the brief; a comment that conflicts with a principle is asked about, not overruled.

Answer each comment with `reply_to_comment` (what changed, or why not), and `resolve_comment` once the next round shows it.

Done when the user says agreed (or picks `Agreed: …`), on one option.

## 8. Hand over

1. Rename the agreed frame `Agreed: <idea>` (and its dark one), and mark it ready for dev with `set_frame_approval`: the user's agreed is the ask. The rounds stay as they are.
2. Report, shaped by [report.md](~/.agents/pr-flow/report.md): the agreed picture beside Before, the frame's link (`/c/<canvas>?frame=<id>`), and the lists: the **parts** it uses with their stories and code paths, **new parts**, **new text**, and **Decided**: each call the design left that you settled (where a moved control goes, what shows when a list is empty), one line each with its reason. A call that's truly the user's (what a student sees, the scope) is asked as one decision with the recommended answer marked ([decision-card.md](~/.agents/pr-flow/decision-card.md)); work the build will do (a story's assertions to update) goes to the build, not the report.

From build-it, its step 6 builds the agreed frame in React: each part from its code path, the layout from the frame's. The PR's pictures are the built app's, before and after, never the frame's; the PR links the agreed frame in one line, for anyone curious how it was designed ([pr-body.md](~/.agents/pr-flow/pr-body.md), "Where it was made"). On its own, the report ends by asking whether to build it.

Done when the report is sent and the agreed frame is marked ready for dev.
