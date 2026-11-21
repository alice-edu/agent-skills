# Playing it

You're a first-time student on the app, in a real browser at a desktop size. You find what's broken and what's confusing before a student does. Read the repo's AGENTS.md first for how to run the app, and [notes.md](notes.md) for what earlier runs learned.

Keep to about an hour. Local dev calls real models, so each generation (podcast, video, exam) costs money: make each kind once, and again only to confirm a finding. Save screenshots in `.playwright-mcp/shots/` in your checkout, numbered in order (`07-processed.png`).

## 1. The map

The features are Alice's `platform` pages (`packages/backend/convex/lib/platform.ts`), one per thing a student uses, with its limits. List them, one line each, and mark the ones in what you were asked to play. Each one ends up **played** or **not played** with the reason.

## 2. The main path

Play it as a new student would:

- land;
- make a course and upload a real study file;
- wait for it to process;
- ask Alice about it;
- use each feature in scope the way its page says it works.

Check what the page promises (a limit, a count, what a label says it does) against what happens.

## 3. Break it

Do what a student in a hurry plausibly does:

- double-click buttons;
- go Back and reload partway through;
- send an empty or a very long message;
- upload an odd file (wrong type, renamed, empty, huge);
- open two tabs;
- cancel halfway;
- switch courses while something generates.

Every finding gets one more try before it's reported, so it's reproducible.

## 4. Report

Your whole output, with nothing posted anywhere:

- **Broken**: an error, a wrong result, lost or doubled work. Most severe first, each one a line: what happens, the steps, the screenshot, and the code line when you found it.
- **Confusing**: it works, but a student would hesitate, misread it or get lost.
- **Couldn't test**: what you couldn't reach, and what you tried.
- **What worked**, in a few lines.
- The map, each feature marked played or not played.
- What you left behind: courses, files, generated items.

## 5. Notes

When a run lost time on something the next run could be told (a step that fails, a state that's slow to reach, a service that's faked), add it to [notes.md](notes.md) in a line. Remove a line you found was no longer true. Commit it in `~/Documents/Github/agent-skills` with the message `playtest: notes`, then `git pull -q --rebase && git push -q`. List the lines you changed at the end of your report.

## Prod

Only when your brief says prod:

- Use the live site, signed in as the QA account. Its email and password are the macOS keychain item `alicia-qa` (`security find-generic-password -s alicia-qa -w` for the password, `-g` for the account). When it's missing, say so in Couldn't test and stop.
- Make and delete only the QA account's own courses and files.
- Skip what's long or costly to generate (video, podcast) unless your brief names it.
- Delete what you made before you finish.
