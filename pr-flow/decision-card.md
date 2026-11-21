# Decision card

the user runs many threads at once, by voice. The **decision card** is every choice that's theirs ("Who decides"), asked **one decision per message**, each with a default, so "go" takes it. A reversible technical choice is never on it: decide it and list it under **Decided**. The card belongs to the command, across every skill it chains (`fix-comments` into `send-for-review`, `full-send` into `babysit-pr`): a skill run by another asks only what the card didn't settle, and only when it truly blocks; anything that can wait goes in the report.

## Who decides

**Agents figure it out first.** Before anything goes on the card, ask: can an agent do it, find it or verify it itself? Then it does, and the result goes in the report. Running a test, a simulator, an emulator, a browser or a check, reading the code, the docs or the logs, measuring, trying access: all the agent's. Only what's truly the user's (below) is asked, and a hand test only when ready.md, "A hand test blocks on the user", says no agent can do it.

Every choice and every finding has an **owner**, apart from its severity:

- **The user's call**: the product. What a student sees or does (a screen, a flow, wording, what's shown when), scope (what's in or out, a fix that grew), a report's triage verdict (`build-it`: bug or not, which item of a bundle), and anything said for the user in public (a reply that disagrees with a human reviewer or declines what they asked, quoted in full). On the card always, even when every reviewer agrees: the agreed answer is the default.
- **Agents' call**: the purely technical. How it's built, an API's shape, which of two working approaches. The docs decide: the repo's (`AGENTS.md` and what it points to), then the technology's own, looked up each time ([lenses.md](lenses.md), "The technology's way"). Decided without asking and listed under **Decided** in the report.
- **Simplify?**: a technical choice gone hairy, where a simpler shape exists only if a requirement gives. The cleanest design the agents can find still needs something heavy (a data migration, a new table, service or package, a flag, a second path doing what one path does; a package that replaces hand-rolled logic doesn't count, lenses.md, "A solved problem"), and dropping or changing one named requirement would remove it. The user's call, as one question: the simpler shape, the requirement it drops, what a student loses, and what it saves. Choosing between documented approaches is the agents'.
- **Stuck**: reviewers still disagreeing on a technical point after the docs and a check that could decide it (a test, a repro, a measurement). One question: both sides in a line each, and which the agents lean to.

A step off the documented path with no precedent found ([lenses.md](lenses.md), "Precedent") goes on the card too, as one question: what it does, what was searched, and the documented alternative it gives up.

A step outside what the skill grants (deleting data, touching production, closing a PR) goes on the card too. Access is tried before it's asked for: what the run has (the CLI, the browser, the env, your notes) is used first, and a request names what was tried. Never ask to bypass branch protection.

**In the user's name.** Free text posted to a person as the user (a review of a teammate's PR, a Slack message beyond slack.md's set posts) is shown as a draft first, its tone kind, and posted once they've seen it. Replies on their own PR's review threads (fix-comments) and the set posts go without asking.

## How to ask

Read this file again right before asking, whenever the last read is from an earlier run or from before the work it asks about: a card often comes long after the skill first loaded it.

1. Do all the work that doesn't depend on the answers first, the card's pictures included, so the card comes with everything else ready. After a review, the card follows its overview ([overview.md](overview.md)), and each question names its row's number.
2. Ask in a plain chat message that ends your turn: one decision, its picture above the question, never a question dialog (it hides the images). The next decision goes in the next message, once this one is answered; work that doesn't depend on the answer carries on between them. Each question is a **tldr** the user can answer cold in ten seconds, without having read the code:
   - **the story first**: what a student sees or does, what goes wrong and when, and why the recommended option avoids it, in a few plain sentences. Parts are named as they look on screen ("the side rail", "the Back to Alice card"), never by code names or file paths;
   - **a picture** when the question is about what a student sees (a look, wording, a control, a dialog, where something sits), also when it isn't built yet: a PNG with the screen now beside each option, made as [screenshots.md](screenshots.md), "Comparison" says (read it before making one). Each option is made for real when it's small; otherwise it's a **mockup**, HTML in the app's look captured with headless Chrome and labelled "(mockup)". A part that doesn't exist yet gets one mockup per option, beside the screen it goes on. It goes in as `![<row>: now and proposed](/absolute/path.png)` after the story. The picture is the image: text drawn in a code block never stands in for it;
   - **a diagram** when the question turns on a flow, the data, an order, a cost, states or access ([diagrams.md](diagrams.md), "When"): each option's way as one picture ([diagrams.md](diagrams.md), "On a card") after the story, the scene's link under it. Where Excalidraw can't be reached, a flow (never a screen) can be a few lines of text in a monospace block showing the moment it goes wrong. Plain words otherwise;
   - options that each say what happens if picked, for the student and for the work, the recommended one first and marked;
   - text to be posted (a reply to a reviewer), quoted in full as a blockquote after the story: the reply is written for the reviewer, the story for the user;
   - the Links line last ([links.md](~/.agents/pr-flow/links.md)).

   Every question has this shape, the picture or diagram after the story:

   ```
   **Decision: <short title>**

   <the story: 2–3 plain sentences>

   1. **<option> (recommended)**: what happens, for the student and for the work
   2. **<option>**: what happens

   Reply 1 or 2.
   ```

   Done with a question when the user could say, from it alone, why the recommended option is right, and a question about what a student sees shows its picture. A question that needs the code to follow gets rewritten.
3. When the user answers "explain" or "I don't get it", that's no pick: explain that question at more length, with a diagram ([diagrams.md](diagrams.md)) when a flow or an order is involved, then ask the same card again.
4. Apply the answers and carry on to the end of the skill. A new choice for the user that turns up later (a full review after the card): ask one more card only when the next step depends on it; otherwise it goes at the top of the report.

No answer: post nothing that depends on it, finish the rest, and start the report with the question.
