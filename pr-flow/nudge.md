# Nudge

While the user's PR waits on review, two things bring its thread back:

- **its watch**, which wakes the thread within the hour when a review lands, a check goes red or the base conflicts;
- **the morning sweep**, one scheduled run over all of the user's PRs, as the backstop.

Between them the thread stays snoozed, so the user sees it again only when there's a review or a decision for them. A PR plainly forgotten isn't bumped here: the daily [digest](digest.md) lists all of them in one post.

## Watching

`send-for-review` ends with the PR watched (`watch_pull_request`, every layer of a stack), and the watch stays on until a review lands ([waiting.md](waiting.md), "Waiting on CI": T3 wakes the thread on a review, a comment, a red check or a conflict). On each wake, run "The check" below for that PR, now. Checks finishing green need nothing, so keep watching and end the turn without a message. Unwatch when the check hands off (Over, Reviewed) or a card goes to the user. A watch that can't read the PR (GitHub's GraphQL limit) is left alone: the sweep covers it.

## The sweep

There's one scheduled task, `Review sweep`, at 09:30 Monday to Friday, `freshSession`, bound to the digest's thread. Its prompt is `Review sweep: follow ~/.agents/pr-flow/nudge.md, "The sweep" (run gh from /Users/emil/Documents/Github/alicia).` It's set up once, never per PR, and nothing has to delete it when a PR merges: it reads the PRs as they are each morning.

1. **The PRs.** List them with `gh pr list --author @me --state open --json number,url,isDraft,body,updatedAt,reviews,reviewDecision,mergeable,baseRefName`. Keep the non-drafts updated in the last 14 days whose body has a `T3 thread:` line. The last such line names the thread that owns the PR now. Also list the user's PRs merged since the last working day: react ✅ on each one's **Up for review** post where it's missing (slack.md, "Reactions").
2. **Decide each PR from GitHub first**, by "The check"'s rules: a review since the round started, a conflict, or a required check red (`gh pr checks <n> --required`). Read Slack only for a PR that has none of these and whose round started more than one working day ago (rules 4 and 6 need the thread and its reactions).
3. **Wake only threads with work**: Reviewed, Fix first, Waiting past its time, Already bumped. For each, `t3_thread_send` (mode `queue`) to the owning thread: `Nudge check for <PR url>: follow ~/.agents/pr-flow/nudge.md, "The check".` Send one message per thread, naming each of its PRs that needs it.
4. **Leave the rest asleep.** Too soon, Waiting and Forgotten get nothing posted. Snooze each of their threads until 10:30 on the next working day (`t3_thread_organize` with its `threadId`).
5. **One line** in the sweep's thread: the date, the count for each rule, and the threads woken, by `link`.

Done when every listed PR has a rule, each thread with work has one message, and the line is posted.

## The check

It runs in the PR's own thread, woken by its watch or by the sweep. It reads everything **since the round started**: the last `send-for-review` message in the Slack thread (the **Up for review** post or the latest **Ready for another round**). Earlier rounds are history.

- The PR: `gh pr view --json state,isDraft,mergeable,reviews,reviewRequests,comments,statusCheckRollup`, and its review comments.
- The whole Slack thread (slack.md, "Finding a PR's thread"), with the reactions on the round's message (`slack_get_reactions`).
- Each reviewer's Slack profile, for an away status.
- This T3 thread, for anything the user said about the PR's timing.

The **reviewers** are everyone the round's message @mentions and everyone requested on GitHub. Often there are none: the post is open to whoever picks it up, and nobody is appointed unless the user named them.

**A stack** is read as one PR: **Over** when every layer is merged or closed, **Reviewed** or **Fix first** when any layer is.

The first of these that's true decides:

1. **Over**: the PR is merged or closed, or this thread is settled. Unwatch; when it's merged, react ✅ on its **Up for review** post (slack.md, "Reactions"). Leave the thread as it is.
2. **Reviewed**: anyone (a reviewer or not) approved, requested changes, left review comments, or asked the user something, since the round started. Unwatch.
   - **An approval and nothing else**: run `full-send`, under the user's standing rule (fix-comments' step 6).
   - **Anything else**: build the overview of what came back (`fix-comments` steps 1 and 2).
     - **Nothing on the card** (every row technical, High and ✅ Fix): run `fix-comments` in full, as if the user had said it. An approval whose shape holds then merges through its step 6. Its report lands in this thread.
     - **Something on the card**: unsnooze and post the overview with the card's questions, ending "say *fix comments* to go". Nothing is fixed, replied or published yet; a row that needs a diagram says so, and it's drawn when `fix-comments` runs.
3. **Fix first**: the base conflicts, or a **required** check is red. Nobody has started reviewing, so make it ready yourself:
   - **A conflict**: merge the base in as `catch-up` does (its steps 2 and 3), and push.
   - **`phone-native` red**: a native PR waiting for its store build, or main's drift, not a check to rerun ([branches.md](branches.md), "phone-native red").
   - **A required check this PR didn't cause** (main fails it too, its test is in files the PR doesn't touch, or it passed on an earlier head of this PR): rerun it once (`gh run rerun <id> --failed`), and go on without waiting for it.
   - **A required check this PR caused**: fix it as `babysit-pr` does ("Each wake"): read its log, fix the whole cause, prove it, push, and say in one line in the PR's thread what changed ("fixed a load test that timed out in CI").

   Nothing else: main moving on, or a red check that isn't required, is no reason to merge or push. The PR stays as the reviewer will meet it.

   Find the cause before deciding the fix is the user's: a slow test, a slow query or a flaky assertion is fixed in the code or the test, and that's technical (the agents' call). It goes to the user only when the fix found would change what a student sees or the PR's scope, the merge is complex (both sides reshaped the same thing), an earlier run already pushed a fix for the same red check, or the PR is a draft again. Then unsnooze, and say what's wrong on a card ([decision-card.md](decision-card.md)).
4. **Waiting, with a reason**: since the round started, someone said why the review is waiting (the reviewer will look later, is busy, is waiting on something; someone asked to hold it), a reviewer reacted 👀 to the round's message, or a reviewer's status says away. Read a named time against the message it was said in: "Thursday" in a Tuesday message is two days later. Keep waiting until one working day after that time. A reason with no time (👀, "soon", an away status) keeps waiting for two working days from when it appeared. After that, unsnooze and ask the user on a decision card ([decision-card.md](decision-card.md)): bump, ask someone else, or leave it.
5. **Too soon**: the round started less than one working day ago.
6. **Already bumped**: since the round's message, the user has posted a message that @mentions a reviewer, and no reviewer replied after it. Unsnooze and ask on a decision card: bump again, ask someone else, or leave it.
7. **Forgotten**: nothing above holds. Post nothing: the next [digest](digest.md) lists it.

A **working day** is Monday to Friday, except Danish public holidays. While waiting (3 once fixed, 4, 5, 7), the watch stays on, and the thread is snoozed until 10:30 on the next working day.

The check ends with one line in this thread: the date, which rule decided and why, and what it did. `Tue 29 Oct: waiting, <reviewer> said Thursday. Snoozed till Fri 10:30.`

Done when the line is posted, and either the thread is snoozed until 10:30 on the next working day with the watch on, or the check handed off (Over, Reviewed, a card).
