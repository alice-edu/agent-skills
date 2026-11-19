# Branches: main and release/next

Where a PR goes, and what merged means on each branch. It applies where the repo has a `release/next` branch (Alicia: `apps/mobile/README.md`, "main and release/next", which has the details). Without one, every PR goes to main.

main always has the **store build's native code**: the phone's JS reaches students over the air after each production deploy. Native work waits on `release/next`, which becomes the next store build.

## The base

Picked once the fix or design is known (build-it, step 4), before the first commit:

- **main**: everything else, including phone JS that uses only native code the store build already has.
- **release/next**: the change adds **native code** no store build has: a package with native code (an `ios` or `android` folder, or a config plugin) added, removed or bumped in `apps/mobile/package.json`, a patch to one, a config plugin, a permission or its wording, `app.config.ts`'s ids: what `fingerprint.config.js` hashes. A package already on main at that version is in the store build: using it is JS, for main. Branch from `origin/release/next` and open the PR with `--base release/next`; commits already made on a branch from main are rebased onto it before the first push.
- **Both**: any backend change the native change needs (a new function, a field, even one mutation) goes to main first, in a PR of its own: functions deploy only from main. This split is required, not a choice for the card. The native PR is branched from `origin/release/next` once that's merged and `release/next` has it (main is merged into it after each deploy). These are build-it's slices, the backend's first.

A **cut** is under way while the `phone-cut` tag exists and its commit isn't in main's history (`git ls-remote --exit-code origin refs/tags/phone-cut`: exit 2 is no tag, no cut; then `git fetch --force origin main 'refs/tags/phone-cut:refs/tags/phone-cut'` and `git merge-base --is-ancestor 'phone-cut^{commit}' origin/main` failing means a cut; the tag stays after the merge back, and a new cut moves it). Till then `release/next` takes no new native code: a native PR waits for the merge back, and the report says so. A cut reruns `phone-native` on the PRs open against `release/next`, so the merge gate's green checks already see it.

## phone-native red

`phone-native` is a required check. Read its log first: red with "which no store build has" (a PR to main) or "release/next's cut" (a PR to `release/next`) means the native code is no store build's, which no code fix or rerun changes. When the PR's own diff touches what the fingerprint hashes, it's on the wrong branch (below); when it doesn't, the drift isn't this PR's: it goes on the card with the log's per-platform lines. Any other error (EAS, git, the fingerprint, a missing token, the job before it) is a flake: rerun it once.

- **On main**: stop (unwatch), and put it on the decision card: moving the PR to `release/next` holds it till the next store release, and the other way is landing what doesn't need the native change on main first, then the native part on `release/next`. Once the user picks the move (`gh pr edit <n> --base release/next`), merge `origin/release/next` into the branch and push a new head (an empty commit when the merge brings nothing): changing the base reruns `phone-native` only, and Check has to run against the new base. Done when `gh pr diff` shows only the PR's own change. Backend in it moves to its own PR to main first ("Both").
- **On release/next during a cut**: it waits for the merge back, which reruns nothing: rerun `phone-native` once the cut is in main's history, or its tag is deleted. Report it as `In sight: waiting for the cut's merge back`.

## Merged and live

Merge with a merge commit on both branches (`gh pr merge <n> --merge`): `phone-native` finds a store build by its commit in main's history.

- **main**: live once the production deploy of the merge commit succeeds, and, when the PR changed what the phone bundles (`node scripts/phoneBundled.mts` lists it), once the phone's update has gone out too: a `Phone deployed` run that sent it has its `main` job green with its "main's JS over the air" step a success, and that step's log shows an update made for each platform, not a warning that nothing was sent (no `EXPO_RELEASE_TOKEN`). Look at the runs for the merge commit and after it (`gh run list --workflow phone-deployed.yml --json databaseId,headSha,event,conclusion,createdAt`, then `gh run view <id> --json jobs`), leaving out the `skipped` ones (previews) and the `cancelled` ones (dropped for a newer run, which covers them: each sends the newest production deploy). Both the push and Vercel's production event start one, so the run that sent it is often the event's. That run's other jobs (`next`, `push`) merge main into `release/next`: a red one there is reported, and doesn't make the PR any less live.
- **release/next**: merged isn't live. It reaches students with the next store build: the cut, the stores' review, and the merge back into main. The report says "Merged into release/next: ships with the next store build". There's no Live message yet: the report says it's owed once the store build is out. Linear's GitHub integration moves the issue on the merge, as on main; Done stays the user's call. The thread is settled: the merge was this run's job.
