# Nudge

While the user's PR waits on review, its **watch** brings its thread back: T3 wakes that one thread when a review or comment lands or a required check goes red, so threads come back one at a time, as things happen. Nothing scheduled sweeps the PRs: a morning sweep over all of them woke 28 threads at once on 25 Nov and crashed the Mac. A PR plainly forgotten isn't bumped here: the daily [digest](digest.md) lists all of them in one post.

Between wakes the thread stays snoozed (waiting.md), so the user sees it again only when there's a review or a decision for them.

## Watching

`send-for-review` ends with the PR watched (`watch_pull_request`, every layer of a stack), and the watch stays on until a review lands ([waiting.md](waiting.md), "Waiting on CI"). On a wake for a review, a comment or a red required check, run "The check" below for that PR, now. Checks finishing green, or a conflict, need nothing: keep watching and end the turn without a message (a conflict is merged when the PR is next worked on, rule 3). Unwatch when the check hands off (Over, Reviewed) or a card goes to the user. A review that lands while the watch can't read GitHub (its GraphQL limit, T3 closed) is caught at the PR's next event, and GitHub notifies the user of it meanwhile.

## The check

It runs in the PR's own thread, woken by its watch. It reads everything **since the round started**: the last `send-for-review` message in the Slack thread (the **Up for review** post or the latest **Ready for another round**). Earlier rounds are history.

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
3. **Fix first**: a **required** check is red, or the base conflicts and the thread is awake for something else. A conflict alone never wakes a thread: main moves several times a day, and catching every PR up each time loads the Mac for nothing. Make it ready yourself:
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

A **working day** is Monday to Friday, except Danish public holidays. While waiting (3 once fixed, 4, 5, 7), the watch stays on, and the thread is snoozed as waiting.md says for a PR waiting on its reviewer.

The check ends with one line in this thread: the date, which rule decided and why, and what it did. `Tue 29 Oct: waiting, <reviewer> said Thursday. Snoozed till Fri 10:30.`

Done when the line is posted, and either the thread is snoozed with the watch on, or the check handed off (Over, Reviewed, a card).
