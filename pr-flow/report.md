# Report

The user skims a thread's report between many others: its first line, what needs them, and its move. A report is what changes for the user; how the work got there is the record, and lives elsewhere. Every report a skill ends with, in this order:

1. **The verdict**, in one line: where it ended (ready, merged, blocked, parked) or what's recommended. Work the user asked to have done (a fix, a feature, a check) opens with one word held to what they asked for, not to what was built: **VERIFIED** (a run showed it does what they asked), **NOT VERIFIED** (it doesn't yet, or nothing ran), or **INCONCLUSIVE** (it ran and couldn't tell). Inconclusive is not a pass, and a negative goes first, never under the good news. From poteto's pstack (MIT).
2. **What changes for the user**, a line each: what's different in the app, the PR, or what they now have to do. The skill's report step names what goes here.
3. **Each screenshot and recording** the run made, inline ([screenshots.md](screenshots.md), "Show them").
4. **Needs you**: every call that's theirs, also one raised earlier and not answered, each with the pick, its evidence and its risk; each hand test; and what couldn't be proven. All of them, however many: this part has no length, and is left out when empty. An unattended run puts its **Attention** section here ([decision-log.md](decision-log.md)).
5. **Decided**: each call taken on their behalf that they'd want to know about, a line each with its reason.
6. **The user's move**: a **You:** line holding the exact words to reply, the recommended answer first, then the Links line ([links.md](links.md)):

   ```
   **You:** reply "last card" (recommended) or "keep card 1", then "send it".
   **You:** answer the card above; "go" takes every recommended answer.
   **You:** nothing, it's with <reviewer>.
   ```

## Writing it

Short declarative sentences. Each claim carries its label, in a report and in any answer ("why did X happen", "is this worth it"), above all where it argues: **measured** (a run, a test or a check showed it), **inferred** (read from code, logs or docs), or **guess**. Never hand the user a check you could run.

## What goes elsewhere

The record of the work: review rounds and what each found, each lens's result, the checks and tests run, the models used, what was tried and dropped, the size. It goes in the PR body ([pr-body.md](pr-body.md)) or the decision log, and the report links it. A claim the user needs proof for keeps its label and one line of evidence, not the story behind it.

Done when someone reading only the first line, Needs you and the **You:** line knows what happened and what to type, and no line in it recounts how the work was done.
