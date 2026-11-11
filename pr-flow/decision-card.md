# Decision card

the user runs many threads at once, by voice. Each voice command asks them at most once: one **decision card** holding every choice that's theirs ("Who decides"), each with a default, so "go" accepts the lot. The card belongs to the command, across every skill it chains (`fix-comments` into `send-for-review`, `full-send` into `babysit-pr`): a skill run by another asks only what the card didn't settle, and only when it truly blocks; anything that can wait goes in the report.

## Who decides

Every choice and every finding has an **owner**, apart from its severity:

- **The user's call**: the product. What a student sees or does (a screen, a flow, wording, what's shown when), scope (what's in or out, a fix that grew), a report's triage verdict (`build-it`: bug or not, which item of a bundle), and anything said for the user in public (a reply that disagrees with a human reviewer or declines what they asked, quoted in full). On the card always, even when every reviewer agrees: the agreed answer is the default.
- **Agents' call**: the purely technical. How it's built, an API's shape, which of two working approaches. The docs decide: the repo's (`AGENTS.md` and what it points to), then the technology's own, looked up each time ([lenses.md](lenses.md), "The technology's way"). Decided without asking and listed under **Decided** in the report.
- **Simplify?**: a technical choice gone hairy, where a simpler shape exists only if a requirement gives. The cleanest design the agents can find still needs something heavy (a data migration, a new table, service or package, a flag, a second path doing what one path does), and dropping or changing one named requirement would remove it. The user's call, as one question: the simpler shape, the requirement it drops, what a student loses, and what it saves. Choosing between documented approaches is the agents'.
- **Stuck**: reviewers still disagreeing on a technical point after the docs and a check that could decide it (a test, a repro, a measurement). One question: both sides in a line each, and which the agents lean to.

A step outside what the skill grants (deleting data, touching production, closing a PR) goes on the card too.

## How to ask

1. Do all the work that doesn't depend on the answers first, the card's pictures included, so the card comes with everything else ready. After a review, the card follows its overview ([overview.md](overview.md)), and each question names its row's number.
2. Ask with the harness's question tool (`AskUserQuestion` in Claude Code; in Codex, the user-input tool its current mode offers), so the thread shows it is waiting. One call. Everything the user reads goes in the question text, which T3 Code renders as markdown, images included; it never shows an option's `preview`. Each question is a **tldr** the user can answer cold in ten seconds, without having read the code:
   - **the story first**: what a student sees or does, what goes wrong and when, and why the recommended option avoids it, in a few plain sentences. Parts are named as they look on screen ("the side rail", "the Back to Alice card"), never by code names or file paths;
   - **a picture** when the question is about what a student sees (a look, wording, a control, where something sits): the comparison ([screenshots.md](screenshots.md), "Comparison"), the screen now beside each option that changes it, as `![<row>: now and proposed](/absolute/path.png)` after the story;
   - **a diagram** when the question turns on a flow, the data, an order, a cost, states or access ([diagrams.md](diagrams.md), "When"): each option's way as one picture ([diagrams.md](diagrams.md), "On a card") after the story, the scene's link under it. Where Excalidraw can't be reached, a few lines of text in a monospace block showing the moment it goes wrong. Plain words otherwise;
   - options that each say what happens if picked, for the student and for the work, the recommended one first and marked;
   - text to be posted (a reply to a reviewer), quoted in full as a blockquote after the story: the reply is written for the reviewer, the story for the user;
   - the Links line last ([links.md](~/.agents/pr-flow/links.md)).

   Done with a question when the user could say, from it alone, why the recommended option is right. A question that needs the code to follow gets rewritten.
3. When the user answers "explain" or "I don't get it", that's no pick: explain that question at more length, with a diagram ([diagrams.md](diagrams.md)) when a flow or an order is involved, then ask the same card again.
4. Apply the answers and carry on to the end of the skill. A new choice for the user that turns up later (a full review after the card): ask one more card only when the next step depends on it; otherwise it goes at the top of the report.

With no question tool, or no answer: post nothing that depends on the card, finish the rest, and start the report with the card.
