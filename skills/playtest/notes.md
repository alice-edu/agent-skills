# What earlier runs learned

- The course screen is in `apps/web/app/(app)/(dashboard)/courses/[courseId]/`.
- A new tab makes the test account and its first course by itself. The default snapshot failed to load on the schema of 2026-11-21: start from empty rather than a snapshot.
- These don't work locally, so they go under Couldn't test without a try:
  - the oral exam: no examiner runs, and the screen sits at 0:00 and then goes back to the lobby;
  - voice mode, dictation and the exam's microphone: the browser has no microphone;
  - Google sign-in.
- Rough times: a PDF processes in under a minute, a written answer is graded in about 20 s, and Explain this takes about 40 s.
- Playwright saves files only inside the checkout.
- The test account keeps courses and sessions from earlier runs in the worktree: make a new course (switcher, New course) to play as a first-time student; `packages/backend/scripts/alice-eval/fixtures/Lecture 3 - Prototyping.pdf` processes in about a minute into 6 goals in 4 topics.
- Practice and guided answer choices are radio inputs laid over their label: click them with `force: true` (Playwright reports the input "intercepts pointer events" otherwise).
