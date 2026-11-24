---
name: phone-release
description: 'Take the phone app through the stores: sort what needs a store build, pick or bundle the cut, try it, cut it, and see it out and merged. Use when the user says "phone release", "store release" or "cut it".'
---

# Phone release

The phone's JS reaches students over the air from main. Only two kinds of work need a **store build**: **native** code, and **store review** (what the stores must see before students do, like buying in the app). This run takes what's ready through one **cut**, the store build `phone-release.yml` makes from one PR's head, and on to out and merged.

The model and every command are in the repo: `apps/mobile/README.md`, "Native releases" and "Store listing", and [branches.md](~/.agents/pr-flow/branches.md). Read both first. Shared files: [decision-card.md](~/.agents/pr-flow/decision-card.md), [ready.md](~/.agents/pr-flow/ready.md), [report.md](~/.agents/pr-flow/report.md).

## 1. Sort what's waiting

Every open PR that touches `apps/mobile`, the PRs the user names, and the `store-release` label (`gh pr list --label store-release`; create the label when it's missing). Each is one kind:

- **Native**: `phone-native` red with "which no store build has" (branches.md, "phone-native red").
- **Store review**: labelled `store-release`, or behind a gate keyed to a store version (like `STORE_SALES_FROM`). Label any such PR that isn't yet.
- **JS**: everything else. Not this run's: `full-send` ships it over the air.

For each native or store-review PR: approved, CI green apart from `phone-native`, based on main (not stacked), the backend it calls already on main. Then whether a cut is under way (branches.md's check): one is, and this run goes to step 5 for it.

Done when the user has a table, one row per PR: kind, ready or what's missing, and its thread's link.

## 2. Pick the cut

- **One ready native PR**: it's the cut.
- **Several**: one native PR holds the native lines of each (packages, `app.config.ts`, patches, ProGuard rules), based on main, with none of the JS that uses them: a branch `phone-release/<version>`, opened as a PR, through `review-loop` on its diff. Each feature's JS merges after the release is out, as plain JS.
- **Store-review work** merges to main before the cut, its gate off, so the cut carries it.
- **Not ready**: waits for the next cut. A ready PR is never held for one, unless the user says. Only when one is close (approved, CI left) is the choice on the card: cut now, or wait for it.

Then on the cut's branch, in one commit: `app.config.ts`'s `version` raised a minor step past the last one the stores have, and the release notes (`storeListing` in every language, README "Store listing") naming what students will notice since the last build, store-review features first.

Done when one head SHA is the cut, with the list of what it carries.

## 3. Try it

Main merged in, CI green apart from `phone-native`. Prove each feature it carries on this head as ready.md says, on a Simlock simulator and emulator. Then `eas workflow:run .eas/workflows/preview.yml --ref <branch>` (from `apps/mobile`) for TestFlight and Play internal: what only a real phone shows is a hand test on that build (ready.md, "Every route first").

Done when each carried feature is seen working on this head, and the hand tests are answered.

## 4. Cut

Before submitting, each store-review gate is set for this version (`STORE_SALES_FROM=<version>` on production's Convex, its products attached to the App Store submission), as its PR's README section says, and App Store Connect has no other version being edited.

The cut sends a build to the stores, so it's the user's go: one card with the SHA, the version and what it carries. On go: `gh workflow run phone-release.yml -f sha=<head>`.

The cut only uploads: each build still has to be sent for review by hand, once EAS's submits finish (`eas submit:list`), in the browser (the user signs in):

- **App Store Connect**: the version made (iris `POST /v1/appStoreVersions`, `releaseType: MANUAL`, with the cut's build), What's New in each language from `storeListing.releaseNotes`, App Review's notes saying how to reach what's new (`store.config.js`'s, plus each store-review feature's path), then a review submission with that version, submitted.
- **Play Console**: the production track's draft for the version: release notes in each language from the same text, rollout 100%, Save, then Publishing overview's Send for review (managed publishing on, so approval waits for Publish). An availability warning the last release shipped with too is ignored, saying why.

Done when its run is green, `phone-cut` names the head, both stores show the version in review, and the #phone-releases thread has the cut.

## 5. Through the stores

The #phone-releases thread follows the cut, and calls the user when they're needed. This run doesn't wait on it: "phone release" again later starts at step 1, which finds the cut under way.

- **Rejected**: fix it on the same PR from the store's reason, withdraw the submission, and cut again with `-f replace=true`.
- **Approved on both**: the user presses Release in App Store Connect and Publish in Play, close together and to everyone (their accounts: one line in the report, with the links).
- **Conflicts with main** (the thread says so): `catch-up` in the cut PR's own thread, which keeps the cut's native code ("A phone cut's PR"). The user says *catch up* there.
- **Live**: the thread runs `-f out=true` and merges. Where it couldn't, run both by hand (README, "Out").

Done when the cut's PR is merged and branches.md's "Merged and live" holds.

## 6. After

Each feature whose JS waited for this build now passes `phone-native`: hand its PR to `full-send`. Remove `store-release` from what went out. A fix the old build's phones can't wait for is a hotfix (README, "The window"), the user's call on the card.

Report per report.md: the version and what went out, what waits for the next cut and why, and the Links line.
