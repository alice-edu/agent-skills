---
name: student-test
description: 'Get takes from a panel of agents on different providers, each playing a student, on whatever the user gives them or what this thread is working on: wording, a screen, a flow. Use when the user says "student test", alongside build-it, review-pr or a UX review, or on its own.'
---

# Student test

A handful of agents, each playing a student, look at something and say how it lands. Use them for a quick read before real students see it.

## 1. What they test

It's what the user gives them, or else the thing this thread is working on. Work out which kind it is, and test that:

- **Wording**: what they think it means, and what they'd expect it to do.
- **A screen or a flow**: where they'd click to reach a goal, what they expect to happen, and what confuses them.
- **Anything else**: the question the user asks.

Give them what a student would see:

- screenshots of the running app (in T3 Code, `preview_snapshot` with `save: true`, which needs the preview panel open), or the ones the user gave. When you can't take any, ask the user for them;
- the text as it appears, in each language it's in. Without a screenshot, give everything on that screen, not only the lines being tested, or they'll report what you left out;
- for a goal, words a student would use. They aren't the app's labels, since those give the way away.

## 2. Who tests

Four agents, started at once with `delegate_task`, on cheap models from both providers: Claude's Haiku or Sonnet, Codex's Luna, Terra or Astra. Never Opus, Fable or Sol. Each brief has:

- a persona in a line: language, what they study, and the apps they already use;
- what they're testing, with the screenshots or text;
- this:

```
Act like a real student in a hurry: skim, and take the first thing that looks right. Use only what
you can see, and invent nothing. Say when you're unsure. Don't tell me whether you like it: tell me
what you understand, what you'd do, and what confuses you, in your own words.
```

## 3. What comes back

Report, shaped by [report.md](~/.agents/pr-flow/report.md):

- what more than one of them got wrong or found confusing, in their words, with a suggested fix for each;
- what only one of them hit, listed apart;
- the panel: each tester's model and persona.

When nobody struggled, say "nothing found", not "it's clear". Agents are better at this than students, so a problem they hit is likely real, and a pass proves little.

**From another skill**: in build-it, fix what's real; in a review, the findings go in under the UI and UX lens ([lenses.md](~/.agents/pr-flow/lenses.md)). **On its own**: report only, and change nothing.
