# Preview

How an agent proves a line on a PR's preview deploy itself ([ready.md](ready.md), "Every route first"), sign-ups included. The examples are Alicia's (Vercel for the web, a Convex deployment a preview); another repo's README names its own. Never print a secret: write it to a `chmod 600` file and read it from there.

## Getting in

The preview is behind Vercel's protection. Read a bypass secret from the Vercel API with the Vercel CLI's own token (`~/Library/Application Support/com.vercel.cli/auth.json`): `GET /v9/projects/<project name>?teamId=<team>` (the team's id from `GET /v2/teams`), and take the key from `protectionBypass` whose note names QA automation. Open the first page with `?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`, or send it as the `x-vercel-protection-bypass` header in Playwright.

## Its backend

The preview's Convex deployment is named in the PR's CI log. Pass it as `--deployment <name>` to `convex data`, `convex env get`, `convex env set` and `convex import`. A switch the check needs (in Alicia, `PAYMENTS_MODE` for Billing) is set on that deployment for the check and unset after; it's the PR's own, never production's.

## Accounts

- **A new account**: sign up as `delivered+<label>-<timestamp>@resend.dev`; Resend accepts it, and each label is a new account. The code is in the subject of the newest row of `pnpm exec convex data emails --component resend --deployment <dep> --format jsonl` ("Your Alice code: NNNNNNNN").
- **An account that exists**: the QA login (the repo's README, "QA login"; its secret from `convex env get QA_LOGIN_SECRET`). It runs a fetch, so do it in Playwright (an iPhone device profile for a phone-sized check), not in the simulator's Safari, and never pass `redirectTo`.
- **A grant, a plan, a role**: give it to the test account with the same command the PR adds or uses, against the preview's deployment.

## Test data

Rows the preview lacks are appended with `convex import --append --table <t> --format jsonLines --deployment <dep>`. A seeded podcast gets `lines: []`: a fake audio URL makes its copy fail.

## The phone

A Simlock simulator or emulator (`device_list`'s host labelled Simlock), with the PR's update loaded, signed in as above.
