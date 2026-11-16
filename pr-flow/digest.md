# Review digest

One post in `#pr-review-channel` listing the user's PRs that were sent for review and that nobody has picked up, so reviewers get one message instead of a bump per PR. A scheduled task (`Review digest`) runs it Monday and Thursday at 10:00; the user can also say "send the digest". The per-PR nudge (nudge.md) still checks each PR and fixes conflicts and red checks; it never bumps on its own.

## Which PRs

Start from the user's open, non-draft PRs (`gh pr list --author @me --state open`). Find each one's **round message**: the user's own top-level post in the channel that links it, or the latest **Ready for another round** the user posted in its thread (posts sent through Claude from the user's account are the user's; a teammate's post of the user's PR isn't). Read the channel's history once, back three weeks (`slack_read_channel` with `oldest`, every page, parsed with a script: the pages are too big to read), and match `alicia/pull/<n>` in each post and its replies; Slack's search misses these links. A PR with no round message in those three weeks is left out. A PR is listed when all of these hold:

- **sent**: it has a round message. A PR never posted in the channel is the user's undecided work, and stays out;
- **unpicked**: since the round message, nobody but the user and bots (Copilot, Vercel, Linear) has reviewed, commented on GitHub, or replied in the thread. An approval before a later round doesn't count: the new round is unpicked until someone answers it;
- **due**: the round message was posted before today, on a working day (nudge.md, "A working day"); one posted on a weekend or holiday counts from the next working day, so it's due the day after that;
- **no reason to wait**: nudge.md's rule 4 doesn't hold (someone said when they'll look, 👀 on the post, a reviewer away). A reply under an earlier digest promising to look at "some of them" names no PR: it holds nothing.

Holds the user set (its `Nudge PR #<n>` task's prompt, from `list_scheduled_tasks`, or what the user said in this thread) are kept: a topic not to mention leaves the title out, a PR not to bump stays off the list.

## The message

```
<A friendly first line in the user's voice, fresh each time, e.g. "Hey!:D i have these prs here that are waiting for review where i would love some help!">
• <<PR url>|#<n>> <short title> · <additions+deletions> lines · <days since the round message>d · <<round message permalink>|thread>
```

Smallest first, every listed PR (the full overview, no "and N more"). The days are calendar days since the round message. A stack is one line: its bottom PR's link, `stack of <n>: <what they add up to>`, the layers' lines summed. Write the first line as `write-like-me` does. The short title is the PR's title cut to what it does, at most about 50 characters. A reviewer is named (`· <@id>`) only where the user requested them on GitHub or the round message @mentions them; everyone else is left to pick. Reviewers answer in each PR's thread, so the post asks nothing else.

Nothing listed: post nothing.

## Done

Read the post back (`slack_read_channel`) and check every link opens the PR or thread it names. Then one line in this thread: the date, the PRs listed, the ones left out and why (`Thu 19 Nov: 9 listed; #1383 reviewed, #1404 not sent`).
