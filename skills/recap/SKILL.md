---
name: recap
description: 'Catch the user up on a thread since their last message: what changed for them, then every call waiting on them, each with a pick, so they can decide from the reply alone. Use when the user says "recap", "where am I at", "where are we" or "what did I miss" (not "catch up": the catch-up skill merges the base in).'
---

# Recap

Catch the user up on what changed in this thread since the last message they wrote before asking, and lay out every call that waits on them so they can make it from this reply alone. Notifications, subagent results and other threads' messages are not their messages. Assume they remember their last message and nothing after it.

Adapted from poteto's `ketchup` in [pstack](https://github.com/cursor/plugins/tree/main/pstack) (MIT).

Not `catch-up`: that brings a branch up to date. This one catches a person up.

## Gather

This turn is read-only: no code changes, no app or job started, nothing posted. Collect your own work since that message, the reports of subagents and children, and what anyone else said in the thread. Check the current state of each PR, CI run and child the thread touched (the PR tools, `t3_thread_read`), not the state you last saw. Check each number against what it comes from, and say so when you correct one.

A **call** is a step only the user can take: a product or UI choice, an approval, a hand test, something that can't be undone, access you lack. Include every one still waiting, also one raised before their last message. Work you can still do yourself isn't a call. Never make one up to fill the reply.

For each call, collect its link, what it changes for students or for the user, the evidence behind your pick, its risk, and your pick. Write "unknown" for a fact the call needs and you don't have.

## Write

Follow [report.md](~/.agents/pr-flow/report.md), with these limits on the story:

- The first line names what waits on them, or says nothing does. If nothing happened and nothing waits, say so and stop.
- Then what happened, pictures first: the screenshots and recordings the work made, inline. Then a line for each thing they asked for, said the way you'd say it out loud ("search was slow from a missing index", not "Search: done"), with whether it's done, running, failed or not checked. At most 100 words for all of it, fewer when less happened. Leave out work that changed nothing for them.
- Then **Needs you**: every call, about 30 words each. This part has no limit: never cut a call or shrink it to a count or a link to stay short. Calls that share one decision (several PRs waiting on a merge) get the decision and pick once, then a line each, riskiest first, with its link and its risk even when low ("low risk: only the colours change"). A call between options gives every option weighed with what it gets and what it costs.
- End with the **You:** line.

Plain words a person would use: "the tests pass", not "CI is green". Hashes, paths, commands and test counts only when they need one to act. Each PR, branch or thread by the name they'd know, linked.

Done when someone who read only their own last message can make every call from this reply without opening anything.
