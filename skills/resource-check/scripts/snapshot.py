#!/usr/bin/env python3
"""Snapshot of what's using this Mac: pressure, usage by kind and by worktree,
and the processes that look safe to kill, each with its evidence.

Run: python3 -I snapshot.py [--json]
Read-only: it kills nothing.
"""
import json, os, re, subprocess, sys
from collections import defaultdict

WORKTREES = os.path.expanduser("~/.t3/worktrees/")
FRESH_MIN = 15  # a server younger than this may be about to be used

# First match wins. Order matters: specific before general.
KINDS = [
    ("Claude session", r"^(\S*/)?claude( |$)"),
    ("MCP server", r"mcp\b|mcp@|-mcp|comfy-mcp|node_repl"),
    ("iOS simulator", r"CoreSimulator|launchd_sim|\.simruntime/"),
    ("Xcode build", r"xcodebuild|/swift-frontend|/clang\b|XCBBuildService|SWBBuildService"),
    ("Android emulator", r"qemu-system|/emulator/emulator"),
    ("Gradle/Kotlin daemon", r"GradleDaemon|KotlinCompileDaemon|GradleWorkerMain"),
    ("Storybook", r"storybook"),
    ("Metro", r"expo start|metro"),
    ("Convex backend", r"convex-local-backend|local\.cjs --ipc-path"),
    ("Temporal", r"temporal server"),
    ("Next dev", r"next dev|next-server"),
    ("vitest", r"vitest"),
    ("Headless Chromium", r"Chromium|chrome-headless|headless_shell|ms-playwright"),
    ("esbuild", r"/esbuild\b"),
    ("pnpm/portless wrapper", r"/pnpm\b|portless"),
    ("Spotlight", r"mdworker|mds_stores|mdsync"),
]
APPS = r"/Applications/([^/]+)\.app/"


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout


def minutes(etime):
    days, _, rest = etime.rpartition("-")
    parts = [int(p) for p in rest.split(":")]
    while len(parts) < 3:
        parts.insert(0, 0)
    h, m, s = parts
    return (int(days or 0) * 24 + h) * 60 + m + s / 60


def kind_of(cmd):
    for name, pat in KINDS:
        if re.search(pat, cmd):
            return name
    m = re.search(APPS, cmd)
    return f"app: {m.group(1)}" if m else "other"


def main():
    procs = {}
    for line in sh("ps -axo pid=,ppid=,rss=,etime=,command=").splitlines():
        pid, ppid, rss, et, cmd = line.split(None, 4)
        procs[int(pid)] = dict(pid=int(pid), ppid=int(ppid), mb=int(rss) / 1024,
                               min=minutes(et), cmd=cmd)

    # cwd of every process in one lsof call (per-PID calls are slow).
    cwd, cur = {}, None
    for line in sh("lsof -d cwd -Fpn 2>/dev/null").splitlines():
        if line.startswith("p"):
            cur = int(line[1:])
        elif line.startswith("n") and cur:
            cwd[cur] = line[1:]

    def worktree(p):
        for text in (cwd.get(p["pid"], ""), p["cmd"]):
            m = re.search(re.escape(WORKTREES) + r"([^/]+/[^/\s]+)", text)
            if m:
                return m.group(1)
        return None

    listen, established = defaultdict(set), set()
    for line in sh("lsof -nP -iTCP -sTCP:LISTEN -Fpn 2>/dev/null").splitlines():
        if line.startswith("p"):
            cur = int(line[1:])
        elif line.startswith("n"):
            listen[cur].add(int(line.rsplit(":", 1)[1]))
    for line in sh("lsof -nP -iTCP -sTCP:ESTABLISHED -Fn 2>/dev/null").splitlines():
        if line.startswith("n") and "->" in line:
            for end in line[1:].split("->"):
                established.add(int(end.rsplit(":", 1)[1]))

    def descendants(pid):
        out, stack = [], [pid]
        while stack:
            q = stack.pop()
            out.append(q)
            stack += [c["pid"] for c in procs.values() if c["ppid"] == q]
        return out

    def sim_udid(p):
        m = re.search(r"/([0-9A-F-]{36})/", p["cmd"])
        return m.group(1) if m else None

    def sim_in_use(p):
        # Something outside the simulator naming its UDID: agent-device's simctl spawn, an xcodebuild.
        udid, own = sim_udid(p), set(descendants(p["pid"]))
        return bool(udid) and any(udid in q["cmd"] for q in procs.values() if q["pid"] not in own)

    def tree_ports(pid):
        ports, stack = set(), [pid]
        while stack:
            q = stack.pop()
            ports |= listen.get(q, set())
            stack += [c["pid"] for c in procs.values() if c["ppid"] == q]
        return ports

    for p in procs.values():
        # A shell's command line quotes what it runs: count the child, not the shell.
        p["shell"] = bool(re.match(r"(/bin/)?(zsh|bash|sh) -c", p["cmd"]))
        p["kind"] = "shell" if p["shell"] else kind_of(p["cmd"])
        p["wt"] = worktree(p)

    # A Claude session is the claude process whose parent isn't claude.
    sessions = [p for p in procs.values() if p["kind"] == "Claude session"
                and procs.get(p["ppid"], {}).get("kind") != "Claude session"]

    by_kind, by_wt = defaultdict(lambda: [0.0, 0]), defaultdict(lambda: [0.0, 0])
    for p in procs.values():
        by_kind[p["kind"]][0] += p["mb"]
        by_kind[p["kind"]][1] += 1
        if p["wt"]:
            by_wt[p["wt"]][0] += p["mb"]
            by_wt[p["wt"]][1] += 1

    gradlew_running = any("gradlew" in p["cmd"] or "GradleWrapperMain" in p["cmd"]
                          for p in procs.values())
    candidates = []

    def add(p, why):
        candidates.append(dict(pid=p["pid"], kind=p["kind"], wt=p["wt"],
                               mb=round(p["mb"]), age_min=round(p["min"]), why=why))

    for p in procs.values():
        c = p["cmd"]
        if p["shell"]:
            continue
        if p["ppid"] == 1 and re.search(r"local\.cjs --ipc-path|react-native-devtools", c):
            add(p, "orphan (PPID 1): its parent is gone")
        elif p["ppid"] == 1 and re.search(r"/pnpm\b.*\b(dev|storybook)", c):
            add(p, "orphan pnpm wrapper (PPID 1)")
        elif re.search(r"GradleDaemon|KotlinCompileDaemon", c) and not gradlew_running:
            add(p, "no gradlew running")
        elif re.search(r"storybook/dist/bin/dispatcher\.js dev|expo start", c):
            ports = tree_ports(p["pid"])
            if p["min"] < FRESH_MIN:
                continue
            if ports and not (ports & established):
                add(p, f"no connection on port {sorted(ports)}")
            elif not ports:
                add(p, "listens on no port")

    # Several Metros in one worktree: all but the newest are duplicates.
    metros = defaultdict(list)
    for p in procs.values():
        if re.search(r"expo start", p["cmd"]) and p["wt"] and not p["shell"] \
                and procs.get(p["ppid"], {}).get("cmd", "").find("expo start") < 0:
            metros[p["wt"]].append(p)

    other = defaultdict(float)
    for p in procs.values():
        if p["kind"] == "other":
            other[os.path.basename(p["cmd"].split()[0])] += p["mb"]

    swap = sh("sysctl vm.swapusage").strip()
    out = dict(
        ram_gb=int(sh("sysctl -n hw.memsize")) / 2**30,
        cores=int(sh("sysctl -n hw.ncpu")),
        swap=swap,
        load=sh("uptime").strip().split("load averages:")[-1].strip(),
        claude_sessions=len(sessions),
        by_kind=sorted(([k, round(v[0]), v[1]] for k, v in by_kind.items()),
                       key=lambda r: -r[1]),
        by_worktree=sorted(([k, round(v[0]), v[1]] for k, v in by_wt.items()),
                           key=lambda r: -r[1]),
        candidates=sorted(candidates, key=lambda c: -c["mb"]),
        duplicate_metros={wt: [p["pid"] for p in ps] for wt, ps in metros.items() if len(ps) > 1},
        # Per booted simulator: its children (~40-55 slim, ~250 stock) and the MB of its tree.
        simulators=[dict(pid=p["pid"], age_min=round(p["min"]), udid=sim_udid(p),
                         in_use=sim_in_use(p),
                         children=len([c for c in procs.values() if c["ppid"] == p["pid"]]),
                         mb=round(sum(procs[d]["mb"] for d in descendants(p["pid"]))))
                    for p in procs.values() if p["cmd"].startswith("launchd_sim ")],
        top_other=sorted(([round(v), k] for k, v in other.items()), reverse=True)[:12],
    )
    if "--json" in sys.argv:
        print(json.dumps(out, indent=1))
        return
    print(f"RAM {out['ram_gb']:.0f} GB, {out['cores']} cores, load {out['load']}")
    print(out["swap"])
    print(f"Claude sessions: {out['claude_sessions']}")
    for sim in out["simulators"]:
        print(f"  simulator {sim['udid']}: {sim['children']} children, {sim['mb']} MB, up {sim['age_min']} min, "
              + ("in use" if sim["in_use"] else "nothing using it"))
    print("\nBy kind (RSS MB, count):")
    for k, mb, n in out["by_kind"][:25]:
        print(f"  {mb:>7}  {n:>4}  {k}")
    print("  other, largest:", ", ".join(f"{k} {mb}" for mb, k in out["top_other"]))
    print("\nBy worktree:")
    for k, mb, n in out["by_worktree"]:
        print(f"  {mb:>7}  {n:>4}  {k}")
    print("\nCandidates to kill:")
    for c in out["candidates"]:
        print(f"  {c['pid']:>6}  {c['mb']:>5} MB  {c['age_min']:>4} min  {c['kind']:<22} {c['wt'] or '-':<22} {c['why']}")
    for wt, pids in out["duplicate_metros"].items():
        print(f"  duplicate Metros in {wt}: {pids}")


main()
