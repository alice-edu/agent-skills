# Ready

What "ready for review" means for a PR of the user's. `build-it`, `fix-comments` and `full-send` hold the PR to this before handing it on; `send-for-review` checks it is still true. The repo's `AGENTS.md` and `.github/pull_request_template.md` say how this repo builds, tests and writes things; this file adds what they leave out. Where the template and `AGENTS.md` disagree (the template names two languages, `AGENTS.md` all six), `AGENTS.md` wins.

## Proof

Proof is evidence observed in this session on the current **head** (the PR's latest commit, with its base merged in): command output, a test that went red without the change and green with it, the running app. Green mocked tests prove the logic; for a change a student sees, proof is the change seen in the running app (`pnpm dev`, the `run` skill), used as a student would: upload the file, send the message, get the answer graded. For the phone app, that's its dev client on both an iOS simulator and an Android emulator (the app's `AGENTS.md` and README say how): its tests run its web build, which shows neither native layout, gestures nor the keyboard. A story stands in for the app only when the change is inside one component's drawing and a story renders each caller's props (how it looks in another engine, a theme); what the change does with the screen around it (a dialog over another, data, a flow) is seen in the app. Opening a screen once proves only the easy case. Each changed screen is tried at its **worst case**, hunting for where it breaks: the longest content, scrolled to the end; the keyboard up over a multi-line input; every expandable part open; each caller of changed shared code. The checklist names the states tried. What that bills (models, grading, reading a file) is part of testing and needs no asking; reuse an upload that already does the job. A check run on an earlier head is history, not proof: after any commit or merge of the base, rerun what the change could affect.

## A small change

A **small change** is under ~30 changed lines (tests, stories and `packages/i18n/messages/` aside) and touches no backend (`packages/backend`, `worker/`), no auth, money or data model, and no code shared beyond the screen it changes. It's held to the same bar with less around it, as pstack's bug fix is: reproduce, fix, see it fixed where it broke, open the PR.

- **No review round.** In place of `review-loop`, name the one fact the change is safe because of and prove it by a run (pstack's blast-radius): the test red without the change and green with it, or the screen used at its main state and its worst case. The PR body's review line: `Small change: no review round; <the fact>, proven by <the run>`.
- **Pictures**: one cropped After, and a Before only for a bug; light and dark only when colours changed; a GIF only when it moves (screenshots.md).
- **No diagram**, unless a card's question needs one.
- **Old debt** the change leans on is fixed, never filed: when the change and the fix together stay small, in this PR as a commit of its own; bigger, in a new thread started now (`t3_thread_launch`, a worktree off the base) that fixes it in its own PR, while this one goes on, linked both ways in the PR bodies. A gap in the change's own feature is always fixed in this PR.
- The verdict from an agent that didn't write it, before the merge (`full-send` step 3), stays: one pass over the changed screen.

A diff that grows past small (a review's fix, the user's next ask) gets the full path from there: `review-loop` on the whole change.

**Used, on every surface.** "Ready", "fixed" and VERIFIED are said only after the change was used as a student would on this head, on every surface it changes (web, each phone, the voice agent answering, the call connecting), never from a passing test or a message alone.

**Loose ends.** Before ready:

- every "I'll come back to it" in the thread is done or on the card;
- each label, key, selector or export the change removes or renames is searched for across the whole repo (`git grep`: E2E tests, the other apps, `packages/i18n`), and every hit is updated;
- the commands CI runs for the touched packages are run as CI runs them (`.github/workflows/`), formatting and lint included.

**Leave nothing running.** Once a proof is done, close what the run opened for it (browsers, simulators, extra servers), except what the report links for the user to try. Start one dev stack and reuse it.

**A platform you can't test yet.** Every platform the change runs on (web, iOS, Android) is tested. One that isn't set up here is set up in this run: the SDK, the emulator image, the tool (Android took 15 minutes). Only one that can't be (it needs hardware or an account we don't have) goes on the decision card before the PR opens, never into Test by hand.

**A stack that won't come up.** Give the local stack (`pnpm dev`, the E2E stack) about 10 minutes, every network call a timeout (`curl -m 30`), and fix the known causes (your notes, the repo's README). Still down: the proof it needed is missing, so the PR isn't ready; report it blocked with the error. The preview deploy is what the user is handed to try, never the agent's proof, unless the user says to prove it there.

## Test by hand

Every line on this list is time the user spends, so it holds only what no agent here can prove. A line earns its place by one of four **reasons**, named in it (two when both hold: body and taste for a haptic's feel):

- **body**: a person's senses, or what only a real device does: a finger on glass (an edge swipe, how a drag feels), haptics, sound out of real headphones or speakers, Bluetooth audio routes, the lock screen, the OS suspending an app in the background, a GPU or OS no machine here has;
- **account**: an account, credential or app this run can't use: the EAS account, a mail client's rendering (Gmail, Outlook);
- **deploy**: what only production has: its data at full size, its domain (app links, cookies), the live deployment's crons. A migration's logic is still proven locally on old data; only its run over production's data is left;
- **taste**: how it feels to a person (is the haptic light, does the motion read as smooth), when whether it works is already proven.

Everything else is proven in this run. What looks untestable usually isn't:

| It seems to need | Prove it here with |
| --- | --- |
| Data the test account lacks (a podcast, 30 history rows, a shared item) | Make it: in the app as a student would, or a seed script. What that bills is part of testing |
| Safari or Firefox | `npx playwright install webkit firefox` in the package whose Playwright drives them (the browsers match its version), then the same steps in each. Screenshot the changed part (`locator.screenshot()`) in each engine and diff it against Chromium's: `ffmpeg -i chromium.png -i webkit.png -filter_complex "[1][0]scale2ref[b][a];[a][b]blend=all_mode=difference,format=gray,geq=lum='255*gt(lum(X\,Y)\,24)',signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null - 2>&1`, whose `YAVG=` is 0 when identical (text anti-aliasing alone gives about 2.5) |
| Android or iOS | The emulator or simulator, set up in this run ([Proof](#proof), "A platform you can't test yet") |
| The phone's store build (old phones against the new backend) | It runs main's phone JS, sent over the air ([branches.md](branches.md)): main in a worktree of its own, its Metro serving the simulator's dev client, pointed at this branch's local backend. A phone that hasn't updated yet: the same with the `phone-cut` tag's commit |
| The preview deploy | Open it with the Vercel bypass (your notes say where the secret is) |
| A screen that's hard to reach (a call, a lesson's end, an error) | Drive the app there, or render it in a story with that state (story ids from Storybook's `/index.json`) |
| A microphone | Chromium launched with `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<file.wav>`, the file spoken by `say -o x.aiff "<words>"` and `ffmpeg -i x.aiff -ar 48000 x.wav` |
| A slow or dropped connection | Playwright's `context.setOffline(true)`, or CDP's `Network.emulateNetworkConditions` for a slow one |
| Dark mode, another language, a long name | Switch to it and look |
| A screen reader | The accessibility tree (Playwright's `ariaSnapshot()`, the simulator's tree): names, roles, order. Only listening to it is left |
| What a migration does to old data | Run it locally on data made the old way (a snapshot saved before the change) |
| A flaky eval or test | Run it enough times to give a rate, and report the rate |
| An email | Render its HTML in each browser engine. Only the mail clients themselves are left |

**Do the part you can.** A line that needs a person for one part has every other part proven first, and asks only for what's left: "the tree reads *Close sheet, button*; listening with VoiceOver is left". A faked event (a remote pause, a headphone unplug sent to the code) proves the code's answer to it, not that the real device sends it, so the line keeps the real delivery.

**Each line shows its attempt**: the reason, then the closest stand-in that was run and what it gave (`Tried: <command or step> → <result>`): the simulator run beside a haptic, the injected unplug beside AirPods. What should happen is something a person can check: a number where it's about speed ("connects within 3 s, as main does"), not "as quickly as before". A line names what to do, never who does it: the user picks who. A line with nothing tried has no reason yet: "not run here", "not opened", "seen in Storybook only" and "no data" each name an attempt still to make, so make it. A local stack that won't come up is a blocker ([Proof](#proof), "A stack that won't come up"), never a line on this list.

`review-loop` checks the list before the PR opens (lenses.md, "Spec"): a line this run could have proven is housekeeping, fixed by proving it.

**Every route first.** Before a line becomes a hand test, try each route the agent has: the PR's preview deploy ([preview.md](preview.md): getting past its protection, signing up, seeding), a Simlock simulator and emulator, a read-only or signed-out call to production (a page, an API, a price), the running stack. A hand test is only what none of them reach (a real phone's mic, a real payment, the user's own account), and its `Tried:` has one entry per route, each with what it gave: `Tried: preview → …; simulator → …; prod → …; local → …`. A route left out, or marked not tried, isn't a reason yet: try it. Neither is a guess about the tool ("the emulator may not blur", "the simulator can't play audio"): test it with a probe (a crop at full size, the suspect layer switched off locally and reverted) and write what the run gave.

**Setup is never a reason.** These are the agent's to set up, on the PR's own preview or the local stack, and then the line is proven:

- a switch, flag or env var that's off: set it on the PR's own preview deployment, check, and unset it (never production's);
- no data, or data in the wrong state: seed it ([preview.md](preview.md), "Test data");
- needs an account, a new one or a signed-in one: sign up or use the QA login (preview.md);
- needs a phone: a Simlock simulator or emulator is a phone. Only what a simulator lacks (the mic, the camera, haptics, push, a real purchase) stays. When the user is away, nothing is asked: the line waits in Test by hand and the run goes on.

### A hand test blocks on the user

Before asking, read the line's `Tried:` against the routes above and the setup list: a route missing, or a reason the list names, means the line isn't a hand test yet, so go and prove it. A line that keeps its reason is a **hand test**, and it waits for the user: the PR isn't sent for review until they've done it or said to skip it (a deploy line: once it's live, in `full-send`). Ask for it in one message, like a decision ([decision-card.md](decision-card.md)), with everything ready so it takes them a minute:

- **why you**: its reason, and what was tried (`Tried: … → …`), in one line;
- **set up**: whatever it needs is already running and loaded, on the newest head: the dev stack or the preview up, the build on their phone and signed in, the account seeded with the data, the screen opened at the right state. Links ready to click;
- **steps**: numbered, one action each, ending in what they should see (a number where it's about speed);
- **answer**: "works", what they saw instead, or "skip".

Their answer goes into the checklist: works is `- [x] Tested by hand by <user>: <what>, at <sha>`; skip is `- [ ] Skipped by <user>: <what>` and lets the PR go on; what they saw instead is a failing check, fixed like a P1 and asked again.

## The checklist

The PR body ends with the checklist (shape in [pr-body.md](pr-body.md)). It is the record of every check this run made, so a reviewer sees what is done and what is left to them:

- `- [x]` marks a requirement that **passed** on the current head, with its evidence: the command, the result, the short SHA (`- [x] Vitest, web: 675 pass at abc1234`).
- A check that fails is written as failing with the reason, and the PR is not ready.
- A requirement that doesn't apply is `- N/A: <requirement>: <why>`, never a tick.
- **Test by hand** lists only what this run can't prove ([Test by hand](#test-by-hand) says what qualifies), ticked once the user has done it; a deploy line stays unticked till it's live. This is also what whoever checks production works from.

Every item below ends as `[x]`, `N/A` or a Test-by-hand line:

1. The template's items, each one.
2. The checks CI runs for what the PR touches (`AGENTS.md`, "CI"): typecheck, lint, format, tests of the touched packages.
3. The base merged in before those final checks, so a key or type another PR added is in the run.
4. Research written in the PR body ([pr-body.md](pr-body.md), "Research") for each outside package the diff uses in a new way and each solved problem it meets: the docs for the installed version read, each named (`next-intl 4.3 useTranslations`), and how others use it. The installed version is in `node_modules/<pkg>/package.json`; its bundled docs or the docs site for that version.
5. Edge cases: the case tables' rows (lenses.md, Correctness), each handled with its evidence (a test where it was a finding and the repo has a place for one), and any left in the body's Not fixed with the other reviewer's AGREE (pr-body.md).
6. A file this PR made large or grew a lot: split considered, with the outcome. Only files the PR itself grew.
7. Each changed screen tried at its worst case (Proof), naming the states tried and what broke; screenshots for every change a student can see, and GIFs for each that moves ([screenshots.md](screenshots.md)), shown to the user in the report; `screenshots-stale` says current on this head (screenshots.md, "Keep them current"); a change nobody sees is `N/A: Screenshots: <why>`.
8. `review-loop` agreed on this head, or for a small change its proving run on this head ("A small change").

## Make it ready

The gate before a reviewer sees the PR: `send-for-review` runs it before posting, and it runs alone when the user asks "is it ready?". The user often keeps changing a PR in its thread after `build-it` opened it, and those commits get no review of their own; this is where they get one.

1. **What changed**: the head `review-loop` last agreed on is in the checklist's item 8 (`review-loop agreed at <sha>`). The same change (`review-loop`'s step 1, "The agreed head": the same patch id, so a merge of the base alone counts as no change): reuse the review. The head itself is the agreed one: reuse it all and go to 4. Otherwise (the base moved): when the base's new commits touch none of the PR's files or what they import (`git diff --name-only <old base>..<new base>`), reuse the proof and rerun only CI's checks; when they do, go to 3, since a base change can break the PR's code.
2. **Review it**: merge the base in, then `review-loop` on the delta since the agreed head, through its callers, as `build-it`'s step 8 ([its Done when](~/.agents/skills/build-it/SKILL.md)).
3. **Prove it again** on the new head: the checks above, the change seen in the running app when a student can see it, and screenshots and GIFs retaken where the screen changed, until `screenshots-stale` says current.
4. **Rewrite the PR body** for where the PR ended up, not where it started ([pr-body.md](pr-body.md)): what changed, the behaviour table, the checklist with this head's SHA, the screenshots and GIFs.

Done when every checklist item is `[x]`, `N/A` or Test by hand on the current head, item 8 included. A P1 the loop can't settle stops it: it goes on the decision card, and the PR isn't announced while it's open.

## Reuse

A check recorded against the same base and head is still proof. A later skill reruns only what a new commit or merge could have changed, and says which checks it reused.
