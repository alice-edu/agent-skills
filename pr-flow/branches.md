# Branches: main, and a native PR that waits

Where a PR goes, and what merged means. It applies where the repo releases the phone app the trunk way (Alicia: `apps/mobile/README.md`, "Native releases", which has the details; `AGENTS.md`, "Phones on the store's build"). Without a phone app, every PR goes to main and merges when it's green.

Everything goes to **main**. main always has the newest **store build's native code**: the phone's JS reaches students over the air after each production deploy. A PR that adds native code is an ordinary PR to main that stays open while its store build is made, and merges once that build is out.

(`release/next` is gone from this model. Until it's deleted, a PR still open against it is retargeted to main, where it waits as any native PR does; nothing new is branched from it.)

## The base

Always main. What differs is whether the PR can merge when it's green:

- **No native code**: everything else, including phone JS that uses only native code the store build already has. It merges as usual.
- **Native code** no store build has: a package with native code (an `ios` or `android` folder, or a config plugin) added, removed or bumped in `apps/mobile/package.json`, a patch to one, a config plugin, a permission or its wording, `app.config.ts`'s ids: what `fingerprint.config.js` hashes. A package already on main at that version is in the store build: using it is JS. The PR holds the native change and the JS that needs it, fails the required `phone-native` check, and stays open till its store build is out ("phone-native red"). Keep it short-lived, with main merged in.
- **Both**: any backend change the native change needs (a new function, a field, even one mutation) goes to main first, in a PR of its own: functions deploy only from main. This split is required, not a choice for the card. These are build-it's slices, the backend's first.

## The native release

Run by the user, or by `phone-release` when they ask for it; never by another pr-flow skill:

1. **Tried**: the PR is approved, main is merged in, and a person has tried its build (`eas workflow:run .eas/workflows/preview.yml --ref <branch>` from `apps/mobile`: TestFlight and Play internal).
2. **The cut**: `gh workflow run phone-release.yml -f sha=<the PR's head>` tags it `phone-cut` (its message: each platform's native code, `pr=<n>`) and starts the store builds. One cut at a time: the next waits till the last is marked out and merged. A fix the stores' review asks for is cut again with `-f replace=true`, the same PR only.
3. **Out**: once it's released in both stores, `gh workflow run phone-release.yml -f sha=<the cut's commit> -f out=true` marks the tag, `phone-native` passes, and the PR merges.

A cut is under way while the `phone-cut` tag exists and its commit isn't in main's history (`git ls-remote --exit-code origin refs/tags/phone-cut`: exit 2 is no tag; then `git fetch --force origin main 'refs/tags/phone-cut:refs/tags/phone-cut'` and `git merge-base --is-ancestor 'phone-cut^{commit}' origin/main` failing means a cut). Till it merges, another native PR waits its turn: the report says so.

Phones still on the build before get a fix only by hand: a `phone-hotfix/<name>` branch from main as it was before the native PR's merge, the fix's commits picked from main (`git cherry-pick -x`), sent with `phone-hotfix.yml`. That's the user's call, on the card.

## phone-native red

`phone-native` is a required check. Read its log first: red with "which no store build has" means the PR's native code is no store build's, which no code fix or rerun changes. Any other error (EAS, git, the fingerprint, a missing token, the job before it) is a flake: rerun it once.

- **The PR's own diff touches what the fingerprint hashes**: it's a native PR, red by design. Get everything else green and reviewed, then stop (unwatch): it waits for the native release. Report it as `In sight: waiting for its store build`, with the cut's command and the head's SHA. Never a card to "fix" the check, and never an admin bypass.
- **It doesn't**: the drift isn't this PR's (main moved, or a cut was made since). Merge main in and rerun; still red, it goes on the card with the log's per-platform lines.

## Merged and live

Merge with a merge commit (`gh pr merge <n> --merge`), the only way main's ruleset and the repo's settings allow: `phone-native` finds a store build by its commit in main's history.

Live once the production deploy of the merge commit succeeds, and, when the PR changed what the phone bundles (`node scripts/phoneBundled.mts` lists it), once the phone's update has gone out too: a `Phone deployed` run that sent it is green with its "main's JS over the air" step a success, and that step's log shows an update made for each platform, not a warning that nothing was sent (no `EXPO_RELEASE_TOKEN`). Look at the runs for the merge commit and after it (`gh run list --workflow phone-deployed.yml --json databaseId,headSha,event,conclusion,createdAt`, then `gh run view <id> --json jobs`), leaving out the `skipped` ones (previews) and the `cancelled` ones (dropped for a newer run, which covers them: each sends the newest production deploy). Both the push and Vercel's production event start one, so the run that sent it is often the event's.

A native PR's merge is live the same way: its store build is already out, and from that deploy main's updates go to the new build alone.
