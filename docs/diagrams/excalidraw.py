"""Draw and check the skill diagrams in the shared Excalidraw scene, over Excalidraw's MCP.

  python3 excalidraw.py draw <name> [x y]      add a diagram from skills.py, at its place in AT unless given
  python3 excalidraw.py shot <out.png> [x y w h]  screenshot the scene, or the shapes inside a box
  python3 excalidraw.py fonts                  list the text fonts in the scene (all should be 6, Nunito)

The key comes from EXCALIDRAW_API_KEY. To redraw a diagram, delete it in Excalidraw first (or pass
replaceDiagramId by hand), then draw it at the same x, y.
"""
import base64, json, os, sys, tempfile, urllib.request

SCENE = "6CBVjVY4H8K"  # https://app.excalidraw.com/s/9GDlHwpjNWo/6CBVjVY4H8K
URL = "https://api.excalidraw.com/api/v1/mcp"
KEY = os.environ.get("EXCALIDRAW_API_KEY") or sys.exit("Set EXCALIDRAW_API_KEY first.")
SESSION = os.path.join(tempfile.gettempdir(), "excalidraw-mcp-session")


def post(body, sid=None):
    h = {"Authorization": "Bearer " + KEY, "Content-Type": "application/json",
         "Accept": "application/json, text/event-stream"}
    if sid:
        h["Mcp-Session-Id"] = sid
    r = urllib.request.urlopen(urllib.request.Request(URL, json.dumps(body).encode(), h), timeout=60)
    raw = r.read().decode()
    if "data:" in raw[:50]:
        raw = [l[5:].strip() for l in raw.splitlines() if l.startswith("data:")][-1]
    return (json.loads(raw) if raw.strip() else None), r.headers.get("Mcp-Session-Id")


def session():
    if os.path.exists(SESSION):
        return open(SESSION).read().strip() or None
    _, sid = post({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
        "protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "agent-skills", "version": "1"}}})
    post({"jsonrpc": "2.0", "method": "notifications/initialized"}, sid)
    open(SESSION, "w").write(sid or "")
    return sid


def tool(name, args):
    res, _ = post({"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                   "params": {"name": name, "arguments": args}}, session())
    return res["result"]


def elements():
    d = json.loads(tool("get_scene_content", {"sceneId": SCENE})["content"][0]["text"])
    return [e for e in (d.get("elements") or d) if not e.get("isDeleted")]


cmd = sys.argv[1] if len(sys.argv) > 1 else ""
if cmd == "draw":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from skills import AT, D
    d = D[sys.argv[2]]
    x, y = map(float, sys.argv[3:5]) if len(sys.argv) == 5 else AT[sys.argv[2]]
    args = {"sceneId": SCENE, "title": d["title"], "direction": "DOWN", "style": "clean",
            "nodes": d["nodes"], "edges": d["edges"], "x": x, "y": y}
    if "groups" in d:
        args["groups"] = d["groups"]
    print(json.dumps(tool("create_diagram", args).get("structuredContent"))[:400])
elif cmd == "shot":
    args = {"sceneId": SCENE, "maxWidth": 1400}
    if len(sys.argv) == 7:
        x, y, w, h = map(float, sys.argv[3:7])
        args["elementIds"] = [e["id"] for e in elements() if e["type"] != "arrow"
                              and x <= e["x"] <= x + w and y <= e["y"] <= y + h]
    for c in tool("take_screenshot", args)["content"]:
        if c["type"] == "image":
            open(sys.argv[2], "wb").write(base64.b64decode(c["data"]))
            print("saved", sys.argv[2])
elif cmd == "fonts":
    texts = [e for e in elements() if e["type"] == "text"]
    print(len(texts), "texts, fonts:", sorted({e.get("fontFamily") for e in texts}))
else:
    print(__doc__)
