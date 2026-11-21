# PR body

The shape of a PR description for the user's PRs, from their recent ones (alicia #737, #725, #713). Write it plainly, with a pass for AI tells (an `unslop`-style skill, when there is one). It describes the current diff and only checks run on the current head.

```markdown
<What a student saw before and what they see now, or the problem and its cause, in 2-4 sentences. No list of files.>

| Before | After |
| --- | --- |
| ![before](<raw url>) | ![after](<raw url>) |

<More screenshot tables when there's more than one state: dark, an error, after an action.>

<For what moves, a table of GIFs the same way: Before | After, or After alone for a new flow.>

| Behaviour | Before | After |
| --- | --- | --- |
| <case> | <what happened> | <what happens now> |

## Diagram

[<What it shows>](<public Excalidraw link>)

![<what it shows>](<raw url>)

## Research

- **<Technology or problem>**: read <doc pages, for the installed version>; looked at <projects>; learned <what>; so <what we chose>.
- **<Off the documented path: the patch, override or workaround>**: precedent <link to the issue, maintainer answer or project doing the same>; upstream <issue link>; drop it when <a fixed version, a merged PR>.

## What changed

- **<Part, in bold.>** What it does now and where (`file.ts`'s `fn`), and why where it isn't obvious.

## Review

Start at `<file>` (<why>), then `<file>`. <The one design decision and what was rejected. Where the risk is. Anything about deploy order or tabs open across a deploy.>

Reviewed by Claude and Codex (`review-loop`, <N> rounds); <what its findings changed>.

## Verify

- [x] <check>: <result> at <short sha>
- [x] <template item> (<evidence>)
- N/A: <template item>: <why>

### Test by hand

- [ ] <What to do>. <What should happen>. (<body|account|deploy|taste>: <why>. Tried: <command or step> → <result>.)
- [x] Tested by hand by <user>: <what>, at <short sha>
- [ ] Skipped by <user>: <what>

Designed in Doop: [<what>](<the agreed round's page>)
T3 thread: <this thread's title>, `t3code://threads/<environmentId>/<threadId>`   ← GitHub only; Slack's form is links.md's

Fixes ALI-123
```

- The behaviour table goes in whenever behaviour changes; the screenshot tables whenever something on screen changes, and the GIFs whenever something moves (screenshots.md, "Recording"). Leave out a section with nothing in it. The Diagram section holds each diagram drawn for this work (diagrams.md): its public link, and its screenshot when it reads at PR width. A change that matches diagrams.md's "When" and has none yet gets one drawn before the body is written.
- The Research section has a line for each technology used in a new way each solved problem, and each step off the documented path with its precedent and when it can go ([lenses.md](lenses.md), "The technology's way" to "Precedent"), so the reviewer can check the reasoning without asking.
- The checklist follows [ready.md](ready.md).
- **Where it was made**, two lines above `Fixes`:
  - **Designed in Doop**, when `sketch-it` agreed a design for this work: the full URL of the agreed round's page (`/c/<canvas>?page=<page>` on Doop's site, the Links line's **Sketch**), for anyone curious how it was designed. One line, no picture: the screenshot tables show the built app, never the sketch.
  - **T3 thread**: this thread's deep link (links.md, "The T3 link on a PR"). Kept on every rewrite of the body; a later thread that works on the PR (fix-comments, catch-up, full-send) adds its own line under it. Outside T3 Code, no line.
- End with `Fixes ALI-123`, or `Part of ALI-123` when the issue stays open (`linear-track`), then the attribution line the harness gives.
