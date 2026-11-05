"""Each skill's diagram, as nodes and edges for Excalidraw's create_diagram. Edit here, then redraw with excalidraw.py."""

def N(id, label, kind="default", group=None):
    n = {"id": id, "label": label, "kind": kind}
    if group: n["group"] = group
    return n

def E(a, b, label=None, kind=None):
    e = {"from": a, "to": b}
    if label: e["label"] = label
    if kind: e["kind"] = kind
    return e

D = {}

D["overview"] = dict(title="1. The big picture: from a report to merged", nodes=[
    N("start", "Bug, idea or\nSlack report", "terminal"),
    N("build", "build-it\nunderstand, build, prove,\nreview until it would pass", "service"),
    N("send", "send-for-review\npost in Slack, request the reviewer", "service"),
    N("wait", "Waiting for review\nthread snoozed, out of your sight", "queue"),
    N("nudge", "Nudge, 09:30 each workday\nreads the whole thread first,\nbumps only if they forgot", "note"),
    N("stale", "catch-up\nmerge main in, fix, prove again", "service"),
    N("over", "Overview of the review\nwhat we'll fix, what needs you", "client"),
    N("q", "Anything\nfor you?", "decision"),
    N("card", "Decision card\none question, a default for each", "client"),
    N("fix", "fix-comments\nfix, re-review the whole PR,\nreply on every comment", "service"),
    N("full", "full-send\nlast nits, CI green, merge", "service"),
    N("live", "Merged and live", "terminal"),
], edges=[
    E("start", "build", "build it"),
    E("build", "send", "send it"),
    E("send", "wait"),
    E("nudge", "wait", "each morning"),
    E("wait", "stale", "branch went stale"),
    E("stale", "wait", "up to date"),
    E("wait", "over", "review lands"),
    E("over", "q"),
    E("q", "fix", "no: it just goes on", "success"),
    E("q", "card", "yes"),
    E("card", "fix", "go"),
    E("fix", "wait", "sent back", "warning"),
    E("wait", "full", "approved", "success"),
    E("full", "live", None, "success"),
])

D["build"] = dict(title="2. Inside build-it", nodes=[
    N("b1", "1. Read where it starts\nyour words, a Linear issue, a Slack report", group="u"),
    N("b2", "2. Check nobody has it\nLinear, open PRs, branches", group="u"),
    N("b3", "3. Track it\nLinear issue to In Progress", group="u"),
    N("b4", "4. Find out what it is\na bug: reproduce it, a test goes red\na feature: design it from the clean setup", group="u"),
    N("b5", "Anything\nfor you?", "decision"),
    N("card", "Decision card\nproduct, UX, scope", "client"),
    N("b6", "6. Build it the right way\nfix the whole cause, clean up\nwhat it leans on", "service", "p"),
    N("b7", "7. Prove it\nchecks, tests, seen in the app", "service", "p"),
    N("b8", "8. review-loop\nClaude + Codex, every lens,\nevery repo doc read", "service", "r"),
    N("b8q", "Would a reviewer\napprove it?", "decision", "r"),
    N("b8f", "Fix it, prove it again", "warning", "r"),
    N("b9", "9. Open the PR\nscreenshots, body, checklist"),
    N("b10", "10. Report\nsay \"send for review\"", "terminal"),
], groups=[{"id": "u", "label": "Understand"}, {"id": "p", "label": "Build and prove"},
           {"id": "r", "label": "Review until it would pass"}],
edges=[
    E("b1", "b2"), E("b2", "b3"), E("b3", "b4"), E("b4", "b5"),
    E("b5", "card", "yes"), E("card", "b6", "your answers"), E("b5", "b6", "no"),
    E("b6", "b7"), E("b7", "b8"), E("b8", "b8q"),
    E("b8q", "b8f", "not yet", "warning"), E("b8f", "b8", "next round"),
    E("b8q", "b9", "yes", "success"), E("b9", "b10", None, "success"),
])

D["fix"] = dict(title="3. Inside fix-comments", nodes=[
    N("in1", "You: \"fix comments\"", "terminal"),
    N("in2", "Nudge: a review landed", "terminal"),
    N("in3", "You: \"review's back\"", "terminal"),
    N("f1", "1. Gather every point\nGitHub reviews, bots, Slack"),
    N("f2", "2. Check each against the code\nFix, Push back or Skip,\nwith High, Med or Low confidence"),
    N("f3", "3. Overview\nyour table, then ours", "client"),
    N("stop", "Stop here:\noverview only", "terminal"),
    N("q", "Anything\nfor you?", "decision"),
    N("card", "Decision card\nproduct calls, replies that push back", "client"),
    N("f4", "4. Fix\nmerge main in, fix the whole cause,\nprove it in the app", "service"),
    N("f4b", "Full re-review from scratch\n+ what could each fix have broken?", "service"),
    N("f5", "5. Push, reply on every comment"),
    N("f6", "6. send-for-review\n\"ready for another round\"", "service"),
    N("f7", "7. Report", "terminal"),
], edges=[
    E("in1", "f1"), E("in2", "f1"), E("in3", "f1"),
    E("f1", "f2"), E("f2", "f3"),
    E("f3", "stop", "said \"review's back\""),
    E("f3", "q"),
    E("q", "f4", "no: all technical and sure", "success"),
    E("q", "card", "yes"), E("card", "f4", "go"),
    E("f4", "f4b"), E("f4b", "f4", "found something", "warning"),
    E("f4b", "f5", "clean", "success"), E("f5", "f6"), E("f6", "f7"),
])

D["loop"] = dict(title="4. Inside review-loop (used by every skill that reviews)", nodes=[
    N("r1", "Scope\nbase, head, what was asked, checks"),
    N("docs", "Both read the lenses\nSpec, Correctness, Standards,\nBackend, UI and UX,\nand every repo doc that applies", "note"),
    N("cx", "Codex reviews", "external"),
    N("cl", "Claude reviews\non its own, at the same time", "service"),
    N("m", "One ledger\nseverity, whose call, evidence"),
    N("q", "Serious issue\nstill open?", "decision"),
    N("fix", "Fix it, prove it\n(when it's our PR)", "warning"),
    N("stuck", "Still disputed after 2 replies,\nor out of rounds", "warning"),
    N("card", "Decision card", "client"),
    N("ok", "Both agree", "terminal"),
], edges=[
    E("r1", "cx"), E("r1", "cl"),
    E("docs", "cx", None), E("docs", "cl", None),
    E("cx", "m"), E("cl", "m"), E("m", "q"),
    E("q", "fix", "yes"), E("fix", "cx", "next round", "warning"), E("fix", "cl"),
    E("q", "ok", "no", "success"),
    E("q", "stuck", "can't settle"), E("stuck", "card"),
])

D["send"] = dict(title="5. Inside send-for-review and the nudge", nodes=[
    N("s1", "Check it's still ready\nchecks green, main merged in"),
    N("s2", "Post in #pr-review-channel\nrequest the reviewer, add the T3 link", "service"),
    N("s3", "Linear: In Review"),
    N("s4", "Schedule the nudge\n09:30 Monday to Friday", "queue"),
    N("s5", "Snooze the thread", "queue"),
    N("n1", "Nudge reads everything since the post\nthe PR, the Slack thread, reactions,\nthe reviewer's away status", "service"),
    N("q", "What does\nit say?", "decision"),
    N("o1", "Merged or closed:\nstop the nudge", "terminal"),
    N("o2", "Reviewed:\nfix-comments or the overview", "client"),
    N("o3", "Red CI or a conflict:\ntell you", "warning"),
    N("o4", "A reason to wait\n(\"Thursday\", looking, away):\nwait", "queue"),
    N("o5", "Already bumped once:\nask you", "client"),
    N("o6", "They forgot:\none polite bump", "service"),
], edges=[
    E("s1", "s2"), E("s2", "s3"), E("s3", "s4"), E("s4", "s5"), E("s5", "n1", "next workday"),
    E("n1", "q"),
    E("q", "o1"), E("q", "o2", None, "success"), E("q", "o3", None, "failure"),
    E("q", "o4", None, "warning"), E("q", "o5"), E("q", "o6"),
    E("o4", "n1", "next morning", "warning"), E("o6", "n1", "next morning"),
])

D["full"] = dict(title="6. Inside full-send", nodes=[
    N("a1", "1. Read where it stands\napprovals, comments, CI, conflicts"),
    N("a2", "2. Settle what's left\nlast nits, merge main in"),
    N("q", "Still what was\napproved?", "decision"),
    N("back", "Back to review\nsend-for-review says what changed", "warning"),
    N("a3", "3. Prove it again\nchecks, the app"),
    N("a4", "4. babysit-pr\nCI and review bots until green", "service"),
    N("a5", "Merge", "service"),
    N("a6", "5. Check it's live\nLinear to Done, nudge stopped"),
    N("a7", "6. Report", "terminal"),
], edges=[
    E("a1", "a2"), E("a2", "q"), E("q", "back", "no: it grew", "warning"),
    E("q", "a3", "yes", "success"), E("a3", "a4"), E("a4", "a5", "green", "success"),
    E("a5", "a6"), E("a6", "a7"),
])

D["review"] = dict(title="7. Inside review-pr (a teammate's PR)", nodes=[
    N("p1", "1. Resolve the round\nthe PR, its Slack thread, the issue"),
    N("p2", "2. review-loop, reviewer mode\nClaude + Codex", "service"),
    N("p2b", "Explain it to you\nwhat changed for students, how,\nwhere the risk is, a diagram", "client"),
    N("p3", "3. Verdict\nserious issue open: changes,\notherwise approve"),
    N("q", "Anything\nfor you?", "decision"),
    N("card", "Overview + decision card", "client"),
    N("p5", "5. Post on GitHub,\nreply in the Slack thread", "service"),
    N("p6", "6. Report", "terminal"),
], edges=[
    E("p1", "p2"), E("p1", "p2b"), E("p2", "p3"), E("p2b", "p3"), E("p3", "q"),
    E("q", "card", "yes"), E("card", "p5", "go"), E("q", "p5", "no", "success"),
    E("p5", "p6"),
])

D["catch"] = dict(title="8. Inside catch-up (a stale branch)", nodes=[
    N("c1", "1. Read where it stands\nsave any half-done work"),
    N("c2", "2. Merge main in\nresolve conflicts the way both sides meant"),
    N("q", "Simple or\ncomplex?", "decision"),
    N("cs", "Checks the merge touches", "service"),
    N("cc", "review-loop on the merge\n+ seen working in the app", "service"),
    N("card", "Both sides can't be true:\ndecision card", "client"),
    N("c4", "4. Push\nan approved PR that changed a lot:\noffer to send it back for review"),
    N("c5", "5. Report", "terminal"),
], edges=[
    E("c1", "c2"), E("c2", "q"), E("q", "cs", "simple"), E("q", "cc", "complex"),
    E("c2", "card", "can't both be true", "warning"),
    E("cs", "c4"), E("cc", "c4"), E("card", "c4"), E("c4", "c5"),
])

D["grill"] = dict(title="9. Inside grilling (\"grill me\")", nodes=[
    N("g0", "You: \"grill me\"\non a plan, a design, an idea", "terminal"),
    N("g1", "Map the design tree\nevery decision, and the ones\nthat hang off it"),
    N("g2", "Find the frontier\ndecisions whose prerequisites\nare already settled"),
    N("gf", "Needs a fact?\na subagent looks it up,\nonly what depends on it waits", "external"),
    N("g3", "Ask one round\nnumbered questions, each with\na recommended answer", "client"),
    N("g4", "You answer\n\"yes\" takes the recommendation"),
    N("q", "Frontier\nempty?", "decision"),
    N("g5", "Confirm a shared understanding\nnothing acted on before you agree", "terminal"),
], edges=[
    E("g0", "g1"), E("g1", "g2"), E("g2", "gf", "facts"), E("gf", "g2", "found"),
    E("g2", "g3", "decisions"), E("g3", "g4"), E("g4", "q", "reshape the tree"),
    E("q", "g2", "no: next round", "warning"), E("q", "g5", "yes", "success"),
])

# Where each one sits in the scene (x, y), so a redraw lands in the same place.
AT = {"overview": (0, 0), "build": (1100, 0), "fix": (1796, 0),
      "loop": (0, 3259), "send": (1262, 3259), "full": (3018, 3259),
      "review": (3715, 3259), "catch": (4391, 3259), "grill": (5200, 3259)}
