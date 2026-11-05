# Nudge

When the user's PR waits on review, a scheduled check looks in each working morning and bumps the reviewers once when they've plainly forgotten. A **smart bump**: it reads the whole conversation first, and bumps only on evidence that nothing is in the way. Meanwhile the thread stays snoozed, so the user sees it again only when there's a review or a decision for them.

## Setting it up

`send-for-review` does this after posting, in T3 Code (outside it, skip this file):

1. `list_scheduled_tasks`, and delete every task titled `Nudge PR #<n>`: each round starts a fresh one.
2. `schedule_task`, bound to this thread, titled `Nudge PR #<n>`, at 09:30 Monday to Friday (`fixed_time`, `weekdays: [1,2,3,4,5]`), with a placeholder prompt.
3. `update_scheduled_task` with the returned id, setting the prompt to `Nudge check for <PR url>, task <scheduledTaskId>: follow ~/.agents/pr-flow/nudge.md, "The check".` A scheduled run can't look its own task up, so the id rides in the prompt.

The thread's snooze is the outer skill's, as waiting.md says: until 10:30 on the next working day, an hour after the check, so a missed run (T3 closed at 09:30) shows the thread rather than hiding it.

**Stopping it.** Whatever ends the wait deletes the task: `full-send` and a merge or close by hand (`list_scheduled_tasks`, then `delete_scheduled_task`), and the check itself, by the id in its prompt.

## The check

Each run starts cold, so it reads everything again, **since the round started**: the last `send-for-review` message in the Slack thread (the **Up for review** post or the latest **Ready for another round**). Earlier rounds are history.

- The PR: `gh pr view --json state,isDraft,mergeable,reviews,reviewRequests,comments,statusCheckRollup`, and its review comments.
- The whole Slack thread (slack.md, "Finding a PR's thread"), with the reactions on the round's message (`slack_get_reactions`).
- Each reviewer's Slack profile, for an away status.
- This T3 thread, for anything the user said about the PR's timing.

The **reviewers** are everyone the round's message @mentions and everyone requested on GitHub.

The first of these that's true decides:

1. **Over**: the PR is merged or closed, or this thread is settled. Delete the task and leave the thread as it is.
2. **Reviewed**: anyone (a reviewer or not) approved, requested changes, left review comments, or asked the user something, since the round started. Delete the task, then build the overview of what came back (`fix-comments` steps 1 and 2):
   - **Nothing on the card** (every row technical, High and ✅ Fix): run `fix-comments` in full, as if the user had said it. Its report lands in this thread.
   - **Something on the card**: unsnooze and post the overview with the card's questions, ending "say *fix comments* to go". Nothing fixed, replied or published yet; a row that needs a diagram says so, and it's drawn when `fix-comments` runs.
   - **No points** (an approval and nothing else): unsnooze and say who approved: "say *full send* to merge".
3. **Not ready to bump**: a check is red, the base conflicts, or the PR is a draft again. The reviewers may be waiting on it. Delete the task, unsnooze, and say what's wrong.
4. **Waiting, with a reason**: since the round started, someone said why the review is waiting (the reviewer will look later, is busy, is waiting on something; someone asked to hold it), a reviewer reacted 👀 to the round's message, or a reviewer's status says away. Read a named time against the message it was said in: "Thursday" in a Tuesday message is two days later. Keep waiting until one working day after that time. A reason with no time (👀, "soon", an away status) keeps waiting for two working days from when it appeared; after that, delete the task, unsnooze, and ask the user on a decision card ([decision-card.md](decision-card.md)): bump, ask someone else, or leave it.
5. **Too soon**: the round started less than one working day ago.
6. **No reviewer**: nobody was @mentioned or requested. Delete the task, unsnooze, and ask the user who should review, suggesting whoever reviewed these files last (`gh pr list --state merged --search <path>`).
7. **Already bumped**: since the round's message, the user has posted a message that @mentions a reviewer, and no reviewer replied after it. Delete the task, unsnooze, and ask on a decision card: bump again, ask someone else, or leave it. Bump again: post it, then set up a new task ("Setting it up").
8. **Bump**: one reply in the Slack thread, @mentioning each reviewer still requested, in the user's voice (slack.md), fitting what the thread last said and the PR's size: "any chance you could take a look today? it's a small one".

A **working day** is Monday to Friday, except Danish public holidays. While waiting (4, 5, 8), snooze until 10:30 on the next working day.

Every run ends with one line in this thread: the date, which rule decided and why, and what it did. `Tue 29 Oct: waiting, Adam said Thursday. Snoozed till Fri 10:30.`

Done when the line is posted, and either the task is deleted or the thread is snoozed until 10:30 on the next working day.
