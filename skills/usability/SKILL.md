---
name: usability
description: 'Make a screen easy to use: judge it like a senior product designer, mainly by Steve Krug''s "Don''t Make Me Think", and fix what a student would trip on in one pass. Use when the user says "usability" or "fix it with usability", and as the UI and UX lens''s principles in review-loop.'
---

# Usability

A screen passes when a student who has never seen it knows, at a glance, what it's for, where they are, and what to click, without reading anything twice. Judge it the way a senior product designer from a top product team would: someone who has watched real people use real screens, and who cuts until what's left is obvious.

The bar sits between ChatGPT and Notion. A student who just wants to study finds one clean path, as easy as a chat box. A power user who goes looking finds the advanced settings and the range they want. Easy by default, powerful when you look.

## The principles

Most important first. A finding names the principle it breaks.

1. **Self-evident, not self-explanatory.** It should be obvious without explanation: what it is, what it does, what happens on a click. When a control needs a tooltip, a help line or onboarding to make sense, the design isn't done; change the control before adding words.
2. **Obvious what's clickable.** What can be clicked looks clickable, and what can't, doesn't. A student never has to hover to find out.
3. **A clear visual hierarchy.** The more important something is, the more it stands out: size, weight, position, contrast. What belongs together sits together; what's nested looks nested. The screen's main action is its most visible one, and there is one.
4. **Conventions over invention.** Use what students already know from the apps they use every day, and what the app's other screens already do. Invent only when it's clearly better, and then make it just as obvious.
5. **Built for scanning.** Students skim, take the first thing that looks right, and muddle through. Clear headings, short labels, and the key word first, so the first thing that looks right is right.
6. **Cut the words.** Halve the text, then halve what's left. Instructions nobody reads, welcome copy and labels that restate the obvious go first.
7. **Mindless choices.** Each click should be an easy one. A choice that makes a student stop and think costs more than an extra click that doesn't.
8. **The trunk test.** Dropped onto this screen with no context, a student can tell which screen it is, what's on it, where they are in the app, and how to get back.
9. **Goodwill runs out.** Every hidden step, surprise, error with no way forward, or lost piece of work spends some. Spend it on nothing the student didn't ask for: keep their place, say what went wrong and how to fix it, never make them do the app's work.
10. **Easy by default, powerful when you look.** The main path holds only what most students need, as calm as ChatGPT. Advanced options sit one obvious step away: a ⋯ menu, an Advanced section, a shortcut. They're quiet but easy to find, never in the way. A power feature that clutters the main path fails, and so does one nobody can find.

Then check the basics:

- **Feedback and recovery** (Nielsen): every action shows it worked, a pending one shows it's pending, and a mistake can be undone or is asked about first.
- **Consistency**: the same thing looks and works the same as on the screens beside it.
- **Accessibility**: every control reachable and usable by keyboard, focus kept after an action, contrast readable, and nothing said by colour alone.

## On its own: a one-shot

When the user says "usability" about a screen, a flow, or what this thread is working on.

### 1. Look

Open the screen in the running app, on the current head, in the state the change is about, and take screenshots. In Alicia: `pnpm dev`, desktop width, light and dark when colours are involved. Phones aren't supported yet. A design that only exists in code or prose is guessed at, not looked at: get it on screen first.

Done when you have a screenshot of every state you'll judge (empty, filled, loading, error where they apply).

### 2. Judge

Go through the principles in order, then the basics. Write each finding as what a student does and where they trip, with the principle it breaks: "Opens a file, looks for how to ask about it, and finds no button: the chat box is the only way, and nothing says so (1)."

Keep only what a student would actually hit on this screen. Taste with no student behind it is dropped.

Done when every principle and basic has a finding or a "clear".

### 3. Fix

Fix the findings, most important first, with the app's own parts: the repo's components and theme, as its `AGENTS.md` says. When nothing in the app fits, a shadcn component is the next choice; a new component comes last. A finding with two reasonable fixes takes the one that's closer to what the app already does.

Some findings are a real product choice rather than a fix: removing a feature from the main path, changing what a flow asks for, renaming something students already know. Those are the user's ([decision card](~/.agents/pr-flow/decision-card.md)): fix everything else first, then ask them all on one card, each with the recommended choice first, and apply the answers. With no answer, leave those changes unmade and start the report with the card.

Prove it per the repo's checks for what you touched, then take the after screenshots in the same states as before.

Done when every finding is fixed or listed as left, with a reason, each product choice is answered and applied or waiting on the card, and each fixed one has its after screenshot.

### 4. Report

- Before and after, side by side, per state.
- What changed and why, one line each, with the principle it serves.
- **Your call**: product choices still waiting on the card, numbered with the recommended answer, so "2: yes" applies one.
- What's left, with why.

Done when the report is sent with every part above, or "none" for a part with nothing in it.

Change nothing outside what was asked. Committing, a PR and a review are for `build-it`, `fix-comments` or the user.

## From review-loop

The UI and UX lens ([lenses.md](~/.agents/pr-flow/lenses.md)) uses these principles, in this order, on a change a student sees. Steps 1 and 2 apply as written, on the PR's screenshots or the running app, with no fixing: the findings go into the ledger. Whose call each one is stays as lenses.md says.
