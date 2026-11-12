# Review lenses

What a review in `review-loop` looks through. Both reviewers apply every lens that fits, each on their own. Pick the lenses from the behaviour the change affects and its callers, not from its paths alone: a shared validator can change what the backend does, and a hook can change a screen.

## Every finding

Each finding names:

- the hunk, or the place something is missing;
- its **source**: a spec line, a repo rule, a doc, or a named smell;
- what it leads to, reachable from the code;
- its evidence.

Where two sources disagree, write the conflict down and never invent a requirement. Skip anything lint already enforces, but do review what lint can't establish, such as whether a cast's `SAFETY:` reason is true. Each finding also has its owner ([decision-card.md](decision-card.md), "Who decides"): one that's the user's call goes on the card whatever its severity. A technical preference with no source and no consequence is dropped.

**The repo's docs.** Before any lens, list every doc in the repo that bears on the change:

- the agent docs (`AGENTS.md`, `CLAUDE.md`) at the root and in each directory the change touches or sits under;
- each doc those point to for what the change touches (in Alicia: `docs/backend-review.md` for the backend, `docs/testing-alice.md` and `packages/backend/convex/teaching-method.md` for how Alice behaves, `apps/web/docs/icons/README.md` for icons, `apps/web-e2e/README.md` for E2E tests);
- the README of each package or folder the change edits.

Read each one in full as it stands at the head, and cite it in findings. Every lens judges against these first. A lens whose docs weren't read is `not verified`, never clear.

What the repo's docs call blocking stays blocking however rare the case. A P0 there (in Alicia, `docs/backend-review.md`'s, for whatever doesn't scale) is a P1 here, and is never downgraded for being "a big course only".

## Spec

Does it do what was asked? The **intent** is the Linear issue, the PR body, the Slack report or the user's words, quoted with its source. Look for:

- requirements that are missing, only partly done, or done wrong;
- behaviour nobody asked for.

Scope creep alone is a P2, or the user's call when it changes what a student sees. When nothing about it is written down, say "no written intent" and review the code against what the PR says it does.

## Correctness

The bug hunt. Look for:

- the intended case being wrong, a regression in a caller, an edge case;
- permissions, and one student's data reaching another;
- whether the tests actually prove the behaviour the change claims.

## Standards

Does it follow the repo's own rules? The repo's docs (above) for what it touches, with the rule cited: those docs are the standard, so read them every time rather than going from memory. Each smell is named (a mysterious name, duplicated code, duplicated state, speculative generality, a middle man, shotgun surgery, a workaround flag) and comes with its fix.

**The right way.** A change leaves the code it touches in the shape it should have, the way a careful teammate would build it from scratch: the right fix, never the quick way around. Old debt never justifies new debt: code nearby already doing it badly is a reason to fix that code too, not to copy it. So:

- a smell the change adds, or a workaround it adds to fit around the shape of nearby code: **P1**, fixed in this PR by fixing the shape;
- old debt the change leans on or extends: fixed in this PR too, kept to what the change touches, and said in the PR body;
- old debt it only passes by: P2, or a Linear issue when it's bigger than the PR.

**The simplest shape.** The design is as small as what it has to do: the plainest version that meets every requirement, built from parts the repo already has. **Over-built** is anything beyond that: an abstraction or option with one user, generality for cases nobody asked for, a new table, service, package, flag or second path where an existing one does the job, state kept twice, defensive code for states that can't happen. Name the simpler version, what it would give up, and what it saves (lines, parts, ongoing cost). Over-built with nothing given up is a P1 under the right way; where the simpler shape drops a requirement, it's a Simplify? question ([decision-card.md](decision-card.md), "Who decides").

**The technology's way.** Code that uses a library or framework (in Alicia: Convex, Next, React, nuqs, zustand, next-intl, shadcn, Tailwind, Turborepo) does it the way that technology's documentation recommends, for the version installed. Each review and each design looks up the pages for the APIs and patterns it judges, once per run: the version from the lockfile, then the official docs for that version (the docs bundled in the package, as turbo's are, or its docs site), cited by page and section. Memory is where the lookup starts, never where it ends. A workaround around the library, a hand-rolled version of what it already provides, or a pattern its docs warn against is a P1 under the right way, fixed to the documented way. Where the docs leave two ways open, pick the one nearer the repo's existing code. Where the repo's own docs chose differently, they win; where only its code did, with no written reason, that's old debt (above).

**A solved problem.** Before writing logic for something other projects have already solved (hover and focus intent, positioning, sanitising, retries and backoff, scheduling, parsing a format, and anything like them), look for what solves it: a platform or framework built-in, a package already installed, then a maintained library. Build on its documented use. Hand-rolled logic for a solved problem is a P1, like a workaround around a library. Adding a package for it is the agents' call, named under **Decided** with what it replaces and the other candidates, each with why it lost (unmaintained, too big, doesn't cover the case).

**How others do it.** The first time the repo uses a technology's API or pattern in a new way (LiveKit's data channels, a new kind of Temporal workflow, a Convex feature it hasn't used), also look at how well-known projects use it (GitHub code search for the API) and hold what they do against the docs. Where the two disagree, the docs for the installed version win: popular code is often written for an older one.

**Precedent.** A change that steps off the documented path (a patched package, a pnpm override, an undocumented option or internal API, a workaround the docs don't describe) is kept only with precedent: the library's issue, discussion or maintainer answer recommending it, or a well-known project doing the same, linked. Search the library's issues first: they often hold the documented fix that makes the workaround unnecessary, which wins. Link the upstream issue too, if one is open, and say what would let us drop it (a fixed version, a merged PR). With no precedent found after that search, it's the user's call, on the decision card with what was searched.

What was read and what it decided goes in the PR body's Research section ([pr-body.md](pr-body.md)).

**Done the first time.** Whatever the change touches is finished in this PR: the small fix, the cleanup it leans on, the cleaner design for what it builds. Each finding is either worth doing, and done now, or optional, and fine to skip with an approval. "Follow-up PR" is neither: it's extra work later, kept only for debt that's too big for this PR and that the change merely passes by. Code already written, in this branch or before it, earns no protection: when a better design turns up mid-build or in review, rewrite to it.

A design change starts from the setup the system should have, then works back to what's there. For each constraint the design inherits (a table's shape, a flag, a split between two paths), ask whether it's a real requirement or an earlier choice that a cleaner setup would drop. Where it's an earlier choice, clear it out first, in its own commits ahead of the change, and build on the clean setup. A design that bends around an earlier bad choice when a cleaner one was in reach is a P1. When clearing it out is much bigger than the change (a data migration, several packages), put both designs on the decision card with what each costs.

## Backend

Applies when the change affects the backend: its data model, queries, workflows, or what they read. Go through every section of the repo's backend review doc, the one `AGENTS.md` points to for backend changes (in Alicia, `docs/backend-review.md`, Adam's checklist), and mark the sections that don't apply as N/A. The doc is the list: follow it as it stands today. Write down the cost of each changed query and workflow step in what grows (in Alicia, F files, N items and the course total), with file:line. A repo with no such doc: say so, and check that it scales with what changed, that a retry does no harm, and that two runs at once don't clash.

## UI and UX

Applies when the change affects what a user sees or does. Look before judging: the PR's screenshots, or the running app on this head. Judged from the diff alone, this lens is **not verified**.

- **Usability first.** Judge it by the principles in the [`usability`](~/.agents/skills/usability/SKILL.md) skill, in their order (its "From review-loop"): self-evident first, then what's clickable, the hierarchy, conventions, and on to easy by default, powerful when you look. Keep only what a student would hit on the screens this change touches; a finding names the principle it breaks.
- **The repo's rules.** Hold it to the `AGENTS.md` sections for what it touches (in Alicia: Components, Where state goes, Text and translations, Panel headers, Row menus, The tour), and cite them.
- **Reuse.** For each new piece of markup, name the existing component that should draw it, or a suitable shadcn one, and say why it fits. A shadcn component the app hasn't added yet is a candidate, not a requirement.
- **States.** Empty, loading, error, long text, dark mode, and a slow or failed action: is there feedback while it's pending, and a way to recover?
- **Confusion.** Write it as what the user does and what then confuses them. The usual cases of the principles:
  - a label that doesn't say what will happen;
  - a click that seems to do nothing;
  - a destructive action that doesn't ask first;
  - a control that's disabled with no reason given;
  - a layout that jumps, or a scroll trap;
  - the same thing done differently from the screens beside it;
  - focus lost after an action, or a control the keyboard can't reach.

  A finding that's a choice about what the user sees (a label's wording, a layout, a flow, what's shown when, what moves behind "advanced") is the user's call, with a recommended answer; one that breaks a written rule is fixed. A missing state is fixed with what the app's other screens already show for it; one with no precedent is the user's call. On someone else's PR (`review-pr`), a usability finding is optional unless a student would hit it on the main path the change touches.

  When the change is a new flow, `student-test` can get takes from a panel of stand-in students.

## Results

The ledger tags each finding with its lens or lenses; a duplicate is one id with several tags. The report gives each lens one result:

- **clear**;
- **findings**, with their ids;
- **N/A**;
- **not verified**, with the reason.

The results are never averaged into one. Spec can fail while Standards passes, and a missing spec only limits what the Spec lens could check: it is neither a pass nor a fail. The merge decision is still one call: any confirmed open P1, from any lens, means changes.
