# Review digest

One post in `#pr-review-channel` listing the user's PRs that were sent for review and that nobody has picked up, so reviewers get one message instead of a bump per PR. A scheduled task (`Review digest`) runs it Monday and Thursday at 10:00; the user can also say "send the digest". The per-PR nudge (nudge.md) still checks each PR and fixes conflicts and red checks; it never bumps on its own.

## Which PRs

Start from the user's open, non-draft PRs (`gh pr list --author @me --state open`), and for each find its **round message** (nudge.md, "The check"): its top-level post in the channel (slack.md, "Finding a PR's thread") or the latest **Ready for another round** in its thread. A PR is listed when all of these hold:

- **sent**: it has a round message. A PR never posted in the channel is the user's undecided work, and stays out;
- **unpicked**: since the round message, nobody but the user and bots has reviewed, commented on GitHub, or replied in the thread, and it isn't approved;
- **due**: the round message is at least one working day old (nudge.md, "A working day");
- **no reason to wait**: nudge.md's rule 4 doesn't hold (someone said when they'll look, 👀 on the post, a reviewer away).

Holds the user set (its `Nudge PR #<n>` task's prompt, from `list_scheduled_tasks`, or what the user said in this thread) are kept: a topic not to mention leaves the title out, a PR not to bump stays off the list.

## The message

```
<A friendly first line in the user's voice, fresh each time, e.g. "Hey!:D i have these prs here that are waiting for review where i would love some help!">
• <<PR url>|#<n>> <short title> · <additions+deletions> lines · <days since the round message>d · <<round message permalink>|thread>
```

Smallest first, every listed PR (the full overview, no "and N more"). The short title is the PR's title cut to what it does, at most about 50 characters. A reviewer is named (`· <@id>`) only where the user requested them on GitHub or the round message @mentions them; everyone else is left to pick. Reviewers answer in each PR's thread, so the post asks nothing else.

Nothing listed: post nothing.

## Done

Read the post back (`slack_read_channel`) and check every link opens the PR or thread it names. Then one line in this thread: the date, the PRs listed, the ones left out and why (`Thu 19 Nov: 9 listed; #1383 reviewed, #1404 not sent`).
