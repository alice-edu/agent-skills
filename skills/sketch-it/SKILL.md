---
name: sketch-it
description: 'Design a screen, flow, panel or landing section with the user in rounds of sketches on a Doop canvas, made from the app''s real components, after references from Mobbin and a usability pass, until the user says agreed. Use when the user says "sketch it", from build-it for a new screen, flow or panel, and from review-pr for alternatives to a teammate''s screen.'
---

# Sketch it

A **sketch** is the real thing drawn early, on a Doop canvas: frames composed from **copies** of the app's own components, each taken on demand from the story that draws it in its Storybook (`~/.agents/pr-flow/story-shot --inline`: the story's drawing with each element's computed styles written on it). Only the layout between parts is written by hand, so what's agreed is what gets built, and each part names the story and file it's copied from.

Each **round** shows the screen **now** beside at most three options, each following a **convention** seen in well-known apps, each checked for usability before the user sees it. The user picks, mixes or comments, in chat or on the canvas; the next round refines. It ends when the user says **agreed**.

Nothing is committed, pushed or posted, apart from the Doop canvas.

## From a review

Started from review-pr, the sketch questions a teammate's screen, so three things change:

- **Now** is the PR's head: the brief is the UI and UX lens's finding, and Storybook runs on a checkout of the PR's head, not the base.
- **PR parts**: a part the PR adds may never merge. Options copy it from the PR's stories like any other, labelled **PR part**.
- **Hand over** goes to the user only: no ready-for-dev mark, no build. The report ends asking whether the round's page goes in the review, as an optional comment.

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
4. **Now**, in that state: a copy of the story that draws it (`story-shot --list <url> <words>` searches by component name: `actions`, not "Study panel"). Read the wrapper that renders the view in the app (`Actions` for `ActionsView`) for props its stories leave out: those are often the state. No story draws it in that state: write one, `<Name>.sketch.stories.tsx` beside the view, uncommitted, with Storybook on the thread's checkout instead.
5. **Check the brief against the picture.** Where the user's words don't match what's on screen ("a wall of tiles" over a list of rows), say so on the card, and sketch for the problem behind the words.

Done when you can say in one line what's sketched, in which state and mode, and have now's copy.

## 2. References

Search Mobbin (its `search_screens`, `search_flows`, or `search_sections` for a landing section; platform `web`) by what the screen is for, not how it looks now: "learning app home, continue where you left off", not "card with a bar". Run two or three queries from different angles; half the results miss. Keep 3–5 from well-known apps that show a convention, each with one line on it ("one dominant resume card, stats beside it: Coursera, Uxcel").

Each reference's picture goes on the canvas beside the option it informs (`upload_asset` from its image URL), so the user compares them without leaving Doop, and its `mobbin_url` goes in the option's note.

Done when each option you'll sketch names a convention from these, and each reference has its link.

## 3. The canvas

Read Doop's guide once (`get_guide`). Its brief, inspiration and image steps are for designs from scratch: here the app's copies are the brief.

1. **One canvas per sketch**, `Sketch: <what>`, made once and reused each round. On a new one, upload the fonts and images the copies list ("Copies"); a later round uploads what it adds. No tokens and no components: the copies carry their own styles.
2. **A page a round**: `<what>: Round <n>` (`create_canvas_page`).
3. **Now**, first on the page: `create_frame` with now's copy at the width it was made at, named `Now`.

Done when the canvas has the fonts and images, and a page with now's frame.

## 4. Sketch

Each option is a frame beside now, named `A: <convention>`, `B: …`, at most three, at the same width (1280 for a screen), 80 px apart, its height fitted to what it holds:

- **Parts** are copies ("Copies") of the stories that draw them, in the state and with the props the option needs: a story missing that state gets one, `<Name>.sketch.stories.tsx` beside the component, uncommitted, with Storybook on the thread's checkout. Each part's line names its story and the file it's built from.
- **Layout** between parts is plain HTML with inline styles, its values read off the copies and the theme (`apps/web/app/globals.css`): flex and grid, gaps and padding on the 4 px grid (16 px is the app's `p-4`), surfaces in the theme's colours, a panel's corners as the app's `rounded-xl` and a row's or control's as its `rounded-lg`, its shadows, text at the app's sizes (14 px body, 12 px labels).
- **Controls**: compare the options with now for controls that are easy to lose while composing, including settings chips, group headings and overflow menus. Keep them unless changing them is the point of the option.
- **Data** is the fake data the app's stories use (`storyData.ts` in Alicia): the same course, files and names, so options compare with now.
- **New text** in English, listed once a search of `packages/i18n/messages/en.json` shows no key says it already.
- **Dark**: when an option's colours are the question, a second frame of it, `A: <convention> (dark)`, built from the `--dark` copies and the theme's `.dark` values.

Look at each with `get_frame_screenshot` beside now's, and fix what draws wrong before anyone sees it: a part that draws unlike its story's picture is `story-shot`'s to fix ("Copies").

Done when every option's frame draws without faults and every piece in it is a copy, a new part so labelled, or (marketing) the landing's own.

## 5. Usability

Read [usability](~/.agents/skills/usability/SKILL.md)'s principles and judge each option by them, its step 2 on the frame's screenshot, without its fixing step. A marketing option is judged as well on its claims: each one true to the sources the section cites, and fair to the products it names. A finding the option can fix within its own idea, fix in the frame and look again. What's left goes on the option's line: what a student (or visitor) would trip on, and the principle.

Done when every option has a verdict: clear, or its findings.

## 6. Show

Read [decision-card.md](~/.agents/pr-flow/decision-card.md) now, whole, and ask as its "How to ask" says, with one difference: each frame is its own picture, not joined with now. A frame's picture is its `image_url` (`export_frame`), saved under a new name each round, `curl -sL -o "$(~/.agents/pr-flow/shot-name <scratchpad>/shots <option>.png)" "<url>"`: a path shown before shows the old frame. One question for the round:

- the problem in a line, and where the brief and the screen differ;
- **now**, then each option, as `![A: <convention>](/absolute/path.png)` with its line under it: the convention and its references' links, what changes, its usability verdict, its new parts and new text;
- the options, the recommended first; from round 2, `Agreed: <the recommended one>` when one's ready. A mix or a comment comes as their reply;
- that comments on the canvas count too, and the Links line with the round's page (`/c/<canvas>?page=<page>`) as **Sketch**.

Without Doop's tools, say so and stop: the sketch needs the canvas.

Done when the card is asked with every frame's picture in the question text.

## 7. Iterate

Read the answer and the canvas's comments (`get_comments` on this round's frames; an element comment's `elementId` is a `data-doop-id` in `get_frame`). A pick, a mix ("A's card with B's order"), or comments become the next round on a new page: `Now`, the option it refines as it was, then its variants, named `<picked><n>: <Convention>` (`A1: Quiet card`), each through steps 4–6. A variant on a convention no reference shows gets a search of its own. Keep the user's words as the brief; a comment that conflicts with a principle is asked about, not overruled.

Answer each comment with `reply_to_comment` (what changed, or why not), and `resolve_comment` once the next round shows it.

Done when the user says agreed (or picks `Agreed: …`), on one option.

## 8. Hand over

1. Rename the agreed frame `Agreed: <convention>` (and its dark one), and mark it ready for dev with `set_frame_approval`: the user's agreed is the ask. The rounds stay as they are.
2. Report, shaped by [report.md](~/.agents/pr-flow/report.md): the agreed picture beside now, the frame's link (`/c/<canvas>?frame=<id>`), and the lists: the **parts** it uses with their stories and code paths, **new parts**, **new text**, and the questions it leaves open (where a moved control goes).

From build-it, its step 6 builds the agreed frame in React: each part from its code path, the layout from the frame's. The PR's pictures are the built app's, before and after, never the frame's; the PR links the agreed frame in one line, for anyone curious how it was designed ([pr-body.md](~/.agents/pr-flow/pr-body.md), "Where it was made"). On its own, the report ends by asking whether to build it.

Done when the report is sent and the agreed frame is marked ready for dev.
