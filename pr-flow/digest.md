# Review digest

One morning post in `#pr-review-channel` listing every PR the team sent for review in the last week that nobody has picked up yet, so the team helps each other get them in, with one message instead of a bump per PR. A scheduled task (`Review digest`) runs it every working day at 08:00; the user can also say "send the digest". The nudge (nudge.md: each PR's watch) still checks each of the user's PRs and fixes red required checks; it never bumps on its own.

## Which PRs

Read the channel's history back one week (`slack_read_channel` with `oldest`, every page, parsed with a script: the pages are too big to read). Every GitHub PR linked from a top-level post, or from a **Ready for another round** reply in its thread, is a candidate, whoever posted it and whichever repo it's in; match `github.com/<owner>/<repo>/pull/<n>` (Slack's search misses these links). Its **round message** is the newest of those posts for it. Look each one up with `gh pr view <url> --json state,isDraft,author,additions,deletions,title,reviewRequests,reviews,comments`. A PR is listed when all of these hold:

- **open for review**: open, not a draft, and its post doesn't hold it ("not ready yet", "don't review");
- **unpicked**: since the round message, nobody but its author and bots (Copilot, Vercel, Linear, Codex) has reviewed, commented on GitHub, or replied in the thread. An approval before a later round doesn't count: the new round is unpicked until someone answers it;
- **due**: the round message was posted before today, on a working day (nudge.md, "A working day"); one posted on a weekend or holiday counts from the next working day, so it's due the day after that;
- **no reason to wait**: nudge.md's rule 4 doesn't hold (someone said when they'll look, 👀 on the post, a reviewer away). A reply under an earlier digest promising to look at "some of them" names no PR: it holds nothing.

For the user's own PRs, holds the user set are kept (what the user said in the PR's own T3 thread, named on the PR body's `T3 thread:` line, or in this thread): a topic not to mention leaves the title out, a PR not to bump stays off the list.

## The message

```
<A friendly first line in the user's voice for the whole team, fresh each day, e.g. "PRs waiting for a first look, let's help each other get them in 🙌">
• <<PR url>|#<n>> <short title> · <author's first name> · <additions+deletions> lines · <days since the round message>d · <<round message permalink>|thread>
```

Smallest first, every listed PR (the full overview, no "and N more"). The author is their first name as plain text, never an @, so the post pings nobody by default. A reviewer is @-named (`· <@id>`) only where the PR's author requested them on GitHub or the round message @mentions them. The days are calendar days since the round message. A stack is one line: its bottom PR's link, `stack of <n>: <what they add up to>`, the layers' lines summed. The short title is the PR's title cut to what it does, at most about 50 characters. Write the first line as `write-like-me` does. Reviewers answer in each PR's thread, so the post asks nothing else.

Nothing listed: post nothing.

## Done

Read the post back (`slack_read_channel`) and check every link opens the PR or thread it names. Then one line in this thread: the date, the PRs listed, the ones left out and why (`Thu 19 Nov: 9 listed; #1383 reviewed, #1416 posted today`).
