---
name: sketch-it
description: 'Design a screen, flow, panel or landing section with the user in rounds of sketches made from the app''s real components, after references from Mobbin and a usability pass, on a Doop canvas and in chat, until the user says agreed. Use when the user says "sketch it", and from build-it for a new screen, flow or panel.'
---

# Sketch it

A **sketch** is the real thing drawn early: the app's own components, theme and fonts, put together in a throwaway Storybook story with fake data, and captured as a picture. Nothing in it is drawn by hand, so what's agreed is what gets built, and building starts from the agreed story's code.

Each **round** shows the screen **now** beside at most three options, each following a **convention** seen in well-known apps, each checked for usability before the user sees it. The user picks, mixes or comments; the next round refines. It ends when the user says **agreed**.

Work in the thread's checkout. The sketch files stay uncommitted (lint may flag their English text; they never ship). Nothing is pushed or posted, apart from the Doop canvas.

## 1. Frame it

1. **What's sketched**: the screen, flow, panel or section, the problem the user wants solved in a line, and the **state** the problem lives in (a new chat, a course under way, a long name). From build-it, the issue says it.
2. **The mode**, by where it lives:
   - **Product** (the app's screens): **real parts** only. Every piece is a component the app has (`components/ui`, the screen's views, `PanelBar`, `StudyParts`), styled by its variants and the theme in `globals.css`, as the repo's `AGENTS.md`, "Components", says. A piece the app doesn't have is built from the theme's tokens and labelled **new part**: adding one is the user's call.
   - **Marketing** (in Alicia, the landing `apps/web/app/(app)/(entry)/login/landing/` and the blog): free layout and pieces of its own, on the brand's basics (the theme's colours, the fonts, the spacing) and the landing's own kit (`parts.tsx`, `landing.css`, the sections beside it). No new-part labels.
   - Neither clearly (the login form, an email): ask on the first round's card.
3. **Now**, in that state. Storybook runs from the checkout (`pnpm storybook` in `apps/web`, a free `PORT` when another runs; one already running serves this checkout when `story-shot --list` shows this checkout's stories). Run `~/.agents/pr-flow/story-shot` from the checkout: `--list <url> <words>` matches stories by title, so search by component name (`actions`, not "Study panel"). Read the wrapper that renders the view in the app (`Actions` for `ActionsView`) for props its stories leave out: those are often the state the problem lives in. No story draws it in that state: the sketch file's `Now` story (step 3) is it.
4. **Check the brief against the picture.** Where the user's words don't match what's on screen ("a wall of tiles" over a list of rows), say so on the card, and sketch for the problem behind the words.

Done when you can say in one line what's sketched, in which state and mode, and have a picture of now in that state.

## 2. References

Search Mobbin (its `search_screens`, `search_flows`, or `search_sections` for a landing section; platform `web`) by what the screen is for, not how it looks now: "learning app home, continue where you left off", not "card with a bar". Run two or three queries from different angles; half the results miss (a "comparison" query returns pages of links to comparisons). Keep 3–5 from well-known apps that show a convention, each with one line on it ("one dominant resume card, stats beside it: Coursera, Uxcel").

Mobbin's pictures stay in this chat: never on the Doop canvas, in a PR, a commit or a public repo. Elsewhere, a reference is its `mobbin_url` and our own line about it. Show Mobbin's `ai_usage_notice` when a result has one.

Done when each option you'll sketch names a convention from these, and each reference has its link.

## 3. Sketch

Write the options as stories in one file beside the component, `<Name>.sketch.stories.tsx`, titled `Sketch/<Name>`: a `Now` story first (the real component, in the state from step 1), then `A_<Convention>`, `B_<Convention>`, at most three. Each option is composed from the real parts, fed the data the component's own stories use (`storyData.ts` in Alicia), or for a section that holds its own data (the landing's), that data exported from its file. A sketch file of another sketch in the checkout is left as it is.

What a sketch may change in real files, each listed for the hand-over and made real or taken back by build-it: an export of a part private to its file; a prop or slot added to a view so an option can put something where the view has no place for it; a style hook on a shared part, the way that part already takes one (`in-data-dense:`). Hiding a view's parts with CSS selectors breaks as the view changes: add the prop instead, also for a hack an earlier round left.

- New words in an option are written in English in the story, and listed as **new text** once a search of `packages/i18n/messages/en.json` shows no key already says them: they go in every language's messages when it's built.
- A marketing option may write its own markup and CSS: one `<style>` in the story, its classes prefixed (`.landing .sk-…`), inside the landing's wrapper (`<div className="landing">` with `landing.css` imported), so it draws as the page does. A piece that needs the server to render (the sign-in button) gets a stand-in that looks the same.
- At desktop width (story-shot's default 1280) and the height the component's own stories use; a landing section, a `--height` that fits the whole section. Light theme, and dark too (`--dark`) when an option's colours are the question and the page has a dark theme; dark pictures go on the card, not Doop.

Capture each with `story-shot <out.png> <url> <id>` (ids from `--list <url> sketch`), one command each, and look at every picture: a story that draws wrong is fixed before anyone else sees it.

Done when every option has a picture that draws without errors, and every piece in it is a real part, a new part so labelled, or (marketing) the landing's own.

## 4. Usability

Read [usability](~/.agents/skills/usability/SKILL.md)'s principles and judge each option by them, its step 2 on the picture, without its fixing step. A marketing option is judged as well on its claims: each one true to the sources the section cites, and fair to the products it names. A finding the option can fix within its own idea, fix in the story and capture again. What's left goes on the option's line: what a student (or visitor) would trip on, and the principle.

Done when every option has a verdict: clear, or its findings.

## 5. Show

**On Doop** (its tools, `mcp__doop__*`). Frames here are pictures, so Doop's own guide's brief, tokens and components don't apply.

1. **The canvas**: one per sketch, `Sketch: <what>`, made once and reused each round. Its guidelines hold the repo's design system, for the people who comment and Doop's own agents: `get_guidelines` first, and only when `<repo>-design` is missing, `set_guidelines` it (the theme's tokens light and dark, the radius steps, the fonts, and `AGENTS.md`'s "Components" rules, in under a page).
2. **A page a round**: `<what>: Round <n>`.
3. **A frame a picture**: `upload_asset` with `local_file: true` (a ticket per file, one after another), run the `curl -T` it gives on the PNG, and take the `url` from what curl prints. Then `create_frame` at half the picture's pixels (story-shot shoots at 2x), named as its story (`Now`, `A: <convention>`), in a row left to right 80 px apart, with `<body style="margin:0"><img src="<url>" alt="<name>" style="display:block;width:<w>px;height:<h>px"></body>`. Check each with `get_frame_screenshot`.

Doop takes no `data:` URIs, and its asset links are public: pictures only, fake data only. Without Doop's tools, say so once and show in chat alone.

**In chat**: read [decision-card.md](~/.agents/pr-flow/decision-card.md) now, whole, and ask as its "How to ask" says, with one difference: each option is its own picture, not joined into one with now (they're too tall to join and still read). One question for the round:

- the problem in a line, and where the brief and the screen differ;
- **now**, then each option, each as `![A: <convention>](/absolute/path.png)` with its line under it: the convention and its references' links, what changes, its usability verdict, its new parts and new text;
- the options, the recommended first; from round 2, `Agreed: <the recommended one>` when one's ready. A mix or a comment comes through the question tool's own free answer;
- that comments on the Doop page count too, and the Links line with the page as **Sketch**.

Done when the card is asked with every option's picture in the question text, and the Doop page holds the same frames.

## 6. Iterate

Read the answer and the canvas's Doop comments (`get_comments`, those on this round's frames: a frame comment's `x, y` are in the picture's CSS pixels, so find what's there in the picture). A pick, a mix ("A's card with B's order"), or comments become the next round: edit the stories, capture, usability, show, on a new page. A round shows `Now`, the option it refines as it was, then its new variants, named `<picked><n>_<Convention>` (`A1_QuietCard`); a picture that hasn't changed reuses its Doop asset. A variant on a convention no reference shows gets a search of its own. Keep the user's words as the brief; a comment that conflicts with a principle is asked about, not overruled.

Answer each Doop comment with `reply_to_comment` (what changed, or why not), and resolve it once the next round shows it.

Done when the user says agreed (or picks `Agreed: …`), on one option.

## 7. Hand over

1. In the sketch file, keep `Now` and the agreed option; delete the rest, and take back the exports and props only they used. On Doop, rename the agreed frame `Agreed: <convention>`.
2. Report, shaped by [report.md](~/.agents/pr-flow/report.md): the agreed picture beside now, the story's path, the Doop link, and the lists: **new parts**, **new text**, exports and props made for the sketch, and the questions the agreed option leaves open (where a moved control goes).

From build-it, its step 6 builds from the agreed story: the real component takes the sketch's layout, the sketch file and its leftovers go ([lenses.md](~/.agents/pr-flow/lenses.md), "Leftovers"), and the PR shows the agreed sketch beside the built screen. On its own, the report ends by asking whether to build it.

Done when the report is sent and the sketch file holds only `Now` and the agreed option.
