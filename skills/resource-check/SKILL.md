---
name: resource-check
description: 'Find what''s eating this Mac''s RAM and CPU (runaway, orphaned or idle processes, other apps), say what''s safe to kill, kill it on the user''s go-ahead, and suggest setup changes so it doesn''t build up again. Use when the user says they''re running out of RAM, the machine is slow, or asks what''s using resources.'
---

# Resource check

The Mac is under **pressure**: many worktrees, agents, dev servers and simulators at once. Find where the memory and CPU went, show the user what's safe to stop with the evidence for each, stop it once they say so, and name what in the setup would keep it from building up again.

## 1. Snapshot

Run `python3 -I scripts/snapshot.py` (this skill's folder). It kills nothing. It prints:

- **pressure**: RAM, cores, load, swap. The signal is swap close to full plus a load several times the core count. `memory_pressure`'s "free %" looks fine while the machine is swapping.
- usage **by kind** and **by worktree** (from each process's cwd), the largest "other" processes, and each booted simulator's size and child count;
- **candidates**: processes that look safe to kill, each with why.

RSS undercounts when swap is full: idle daemons look tiny because they're swapped out. Say so in the report.

Done when you know what the largest five kinds are and which worktrees hold them.

## 2. Check each candidate

The script's evidence is a lead. Confirm each one before calling it safe:

- **Orphans** (PPID 1): Convex `local.cjs --ipc-path` executors whose backend died, `react-native-devtools`, `pnpm dev` / `storybook` wrappers. Safe.
- **Gradle and Kotlin daemons** with no `gradlew` running. Safe; the next Android build starts them again.
- **Storybook and Metro** with no ESTABLISHED connection on their port (`lsof -iTCP:<port> -sTCP:ESTABLISHED`). Safe once they're over 15 minutes old: a younger one may be about to be used. Several Metros in one worktree: all but the one in use.
- **Another worktree's `pnpm dev` stack** (Convex, Temporal, Next, Metro): ask first. AGENTS.md forbids stopping it unasked, and it stops by itself after `DEV_IDLE_STOP_HOURS` with no tab.
- **Booted simulators** (the script's per-simulator lines) that the script says nothing is using (no process outside it names its UDID: agent-device's `simctl spawn`, an `xcodebuild`) and up over 15 minutes: safe. Close each with `device_close` and `shutdown: true`, which hands it back to Simlock's pool; never `xcrun simctl` or a kill.
- **Native builds** (`xcodebuild`, Gradle): ask first; note when two run at once or one builds x86_64 as well as arm64.

Then map the Claude sessions to T3 threads (`t3_thread_list`): which are running, and which finished threads still hold a `claude` process with their own MCP servers. The script counts one session per parent `claude`; each also has a child that isn't a session.

Done when every candidate is confirmed safe, moved to "ask first", or dropped, each with its evidence.

## 3. Report

Lead with the recommendation, short:

1. One line: how bad (swap, load) and the main cause.
2. A table: what, RAM, note. Largest first, at most ~10 rows.
3. **Safe to close now**: each item with its evidence, and the command.
4. **Ask first**: other worktrees' stacks, running builds, simulators in use, finished threads (restarting T3 Code frees those).
5. **Other apps**: browser, Codex, Wispr, Doop, Loom, Slack, Linear, Spotlight's `mdworker`, with their RAM.
6. **Setup changes**: what in the repo or on the machine would stop this building up. First check whether a fix is already there (`scripts/`, the repo's AGENTS.md, `~/.gradle/gradle.properties`, the MCP config), and where one is, check it's working (an idle stop that should have stopped something that's still running) instead of suggesting it again.

## 4. Kill, on the go-ahead

Kill only what the user said yes to. In zsh a space-separated `$pids` isn't split, so `kill $pids` fails silently: use an array, then check each PID.

```zsh
pids=(123 456 789)
kill "${pids[@]}"
for p in "${pids[@]}"; do kill -0 $p 2>/dev/null && echo "$p still alive"; done
```

Whatever's still alive after a few seconds gets `kill -9`. Then run the snapshot again and report swap and load before and after.

## Known setup

- **Simulators** come from Simlock (`~/.simlock/config.json`), already slim (`ios.defaultMode: "slim"`): a stock simulator has ~250 processes under `launchd_sim`, a slim one far fewer. Several booted at once is the cost, not each one's size: Simlock's warm pool keeps them, `device_close` with `shutdown: true` returns one.
- **Android emulators** from Simlock use `hw.gpu.mode: auto` and no `-lowram` (what avdslim fixes): matters only while one runs.
- **comfy-mcp** and **playwright-mcp** start in every Claude session from the global MCP config.
