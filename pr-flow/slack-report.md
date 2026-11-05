# A report from Slack

What `build-it` adds when its work starts from a Slack message: student feedback, an error alert, a teammate's report. Most of what arrives isn't a clean bug: survey replies are often feature wishes in Danish, a relayed post bundles several points, and many error alerts are noise. Channels and message formats: slack.md.

## Reading it

Read the message, its whole thread, its images, and whatever it links: a PostHog issue or person (the PostHog MCP), a Linear issue, a session. Keep the reporter's words as written beside an English translation when they aren't English. Note the `For:` owner on a survey reply: `full-send` tags them when the fix is live.

When it holds several separate problems, list them. The one the user named is this run's; with none named, the clearest one. The others go on the decision card: a Linear issue each, or left.

## Taken

A reply in the thread saying someone's on it counts as taken, beside `build-it`'s own checks.

## Claiming it

The Linear issue's description holds the reporter's words, the translation, and the Slack permalink: that link is how `full-send` finds the thread again. Then, checking the thread once more for a claim that landed meanwhile, post the **Looking into it** line in it (slack.md). Done when the issue holds the link and the claim is in the thread once.

## An error alert

In PostHog: how often, for how many students, since which release, and whether it's still happening. A chunk that failed to load or "module factory is not available" is a tab left open across a deploy, which the repo accepts (`AGENTS.md`); "Failed to fetch" and NetworkError are usually the student's connection. Look for a cause in our code before calling it noise.

## Parked

- **Unconfirmed**: post the reply agreed on the card in the thread.
- **Big feature**: reply in the thread with where it's tracked.
