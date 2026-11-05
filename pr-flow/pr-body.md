# PR body

The shape of a PR description for the user's PRs, from their recent ones (alicia #737, #725, #713). Write it plainly, with a pass for AI tells (an `unslop`-style skill, when there is one). It describes the current diff and only checks run on the current head.

```markdown
<What a student saw before and what they see now, or the problem and its cause, in 2-4 sentences. No list of files.>

| Before | After |
| --- | --- |
| ![before](<raw url>) | ![after](<raw url>) |

<More screenshot tables when there's more than one state: dark, an error, after an action.>

| Behaviour | Before | After |
| --- | --- | --- |
| <case> | <what happened> | <what happens now> |

## Diagram

[<What it shows>](<public Excalidraw link>)

![<what it shows>](<raw url>)

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

- [ ] <What to do>. <What should happen>. (<Why it couldn't be tested here.>)

Fixes ALI-123
```

- The behaviour table goes in whenever behaviour changes; the screenshot tables whenever something on screen changes. Leave out a section with nothing in it. The Diagram section holds each diagram drawn for this work (diagrams.md): its public link, and its screenshot when it reads at PR width.
- The checklist follows [ready.md](ready.md).
- End with `Fixes ALI-123`, or `Part of ALI-123` when the issue stays open (`linear-track`), then the attribution line the harness gives.
