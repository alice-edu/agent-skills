#!/usr/bin/env node
// Copies rendered UI into Paper as editable artboards, measured from a real browser, so a
// design starts from what the app draws rather than from a guess.
//
//   node to-paper.mjs storybook --base http://localhost:6006 --page <pageId> [--only <title, folder or story id>,...]
//        [--globals theme:dark] [--suffix " · dark"] [--commit <sha>] [--prune] [--force]
//   node to-paper.mjs page --url <url> --name <artboard name> --page <pageId> [--selector <css>]
//        [--viewport 1440x900] [--color-scheme dark] [--storage-state <file>] [--replace]
//
// Common: [--file <fileId>] [--out <dir>] writes each artboard's HTML there too, and
// [--dry-run] skips Paper (with --out, to check a capture). Paper Desktop must be open.
//
// Storybook mode renders every story and rewrites only the artboards whose render changed:
// each story's fingerprint (a hash of what was captured) is kept on the page's stamp
// artboard, `Synced` (plus the suffix), with the commit when a full run captured every story.
// --force rewrites them all.
//
// Paper takes HTML with inline styles, flex for layout, and no margins, grid, tables or
// inline elements. So each element is measured in the browser and rebuilt: a flex
// container whose children are plain flex items stays flex (with its padding and gap);
// anything else is placed at its measured position, and loose text line by line. Sizes
// are fixed to what was measured. A background picture, or an svg that only frames one,
// becomes an image. A story is framed by what it draws: no backdrop behind a dialog, nothing
// off the page, no wrapper stretched to the window. Not copied: ::before/::after content,
// animations.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// ---------- Options ----------

const FLAGS = { storybook: ["prune", "force", "dry-run"], page: ["replace", "dry-run"] };
const VALUES = {
  storybook: ["base", "only", "globals", "suffix", "commit", "top"],
  page: ["url", "name", "selector", "viewport", "color-scheme", "storage-state"],
};
const COMMON = ["file", "page", "out"];
const [mode, ...rest] = process.argv.slice(2);
function usage(why) {
  console.error(`to-paper: ${why}\nusage: to-paper.mjs storybook|page ... --page <pageId> (see the top of this file)`);
  process.exit(2);
}
if (!VALUES[mode]) usage(`unknown mode ${mode ?? "(none)"}`);
const opt = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("--")) usage(`unexpected ${rest[i]}`);
  const k = rest[i].slice(2);
  if (FLAGS[mode].includes(k)) opt[k] = true;
  else if (VALUES[mode].includes(k) || COMMON.includes(k)) {
    // --suffix " · dark" is a value; anything else starting with -- is a missing one.
    if (i + 1 >= rest.length || (rest[i + 1].startsWith("--") && k !== "suffix")) usage(`--${k} needs a value`);
    opt[k] = rest[++i];
  } else usage(`unknown option --${k} for ${mode}`);
}
if (!opt.page && !opt["dry-run"]) usage("--page is required");
if (mode === "page" && !opt.url) usage("--url is required");
if (opt.viewport && !/^\d+x\d+$/.test(opt.viewport)) usage("--viewport is <width>x<height>");
if (opt["color-scheme"] && !["light", "dark"].includes(opt["color-scheme"])) usage("--color-scheme is light or dark");
if (opt.top && !Number.isFinite(Number(opt.top))) usage("--top is a number");
for (const k of ["url", "base"]) {
  if (!opt[k]) continue;
  try {
    new URL(opt[k]);
  } catch {
    usage(`--${k} is not a URL: ${opt[k]}`);
  }
}

// ---------- Paper, through its own MCP binary (the one its plugin runs) ----------

class Paper {
  constructor() {
    const bin = process.env.PAPER_BIN || join(homedir(), ".paper/bin/paper");
    this.proc = spawn(bin, ["mcp"], { stdio: ["pipe", "pipe", "inherit"] });
    this.next = 1;
    this.waiting = new Map();
    let buf = "";
    this.proc.stdout.on("data", (d) => {
      buf += d;
      let n;
      while ((n = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, n);
        buf = buf.slice(n + 1);
        if (!line.trim()) continue;
        const msg = JSON.parse(line);
        const w = this.waiting.get(msg.id);
        if (w) {
          this.waiting.delete(msg.id);
          msg.error ? w.reject(new Error(JSON.stringify(msg.error))) : w.resolve(msg.result);
        }
      }
    });
  }
  send(method, params) {
    const id = this.next++;
    this.proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return new Promise((resolve, reject) => this.waiting.set(id, { resolve, reject }));
  }
  async start() {
    await this.send("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "to-paper", version: "1" },
    });
    this.proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  }
  async call(name, args) {
    if (opt.file) args = { fileId: opt.file, ...args };
    const res = await this.send("tools/call", { name, arguments: args });
    const texts = (res.content || []).filter((c) => c.type === "text").map((c) => c.text);
    if (res.isError) throw new Error(`${name}: ${texts.join("\n")}`);
    // Paper sends the file's details first, then the tool's own result.
    const parsed = texts.map((t) => {
      try {
        return JSON.parse(t);
      } catch {
        return t;
      }
    });
    return parsed[parsed.length - 1];
  }
  stop() {
    this.proc.stdin.end();
    this.proc.kill();
  }
}

// ---------- The capture, run inside the page ----------

// Returns { html, width, height, background, images } for `selector`, or for the union of
// its children when `fit` is set (a Storybook root is wider than the story it holds).
function capture({ selector, fit, pad }) {
  const images = [];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const attr = (s) => esc(s).replace(/"/g, "&quot;");
  const px = (n) => `${Math.round(n * 100) / 100}px`;
  const SIDES = ["Top", "Right", "Bottom", "Left"];
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    // Text for screen readers only (sr-only), clipped to nothing.
    if (cs.clipPath === "inset(50%)" || cs.clip === "rect(0px, 0px, 0px, 0px)") return false;
    const r = el.getBoundingClientRect();
    // Above or left of the page, where nothing can scroll to: a library's measuring box
    // (Recharts puts one at top -20000px), not something drawn.
    if (r.bottom < 0 || r.right < 0) return false;
    // A story's dialog or sheet behind its backdrop: the part, not the dimmed screen around it.
    if (fit && cs.position === "fixed" && r.width >= innerWidth - 1 && r.height >= innerHeight - 1 && !el.children.length && !el.textContent.trim())
      return false;
    return r.width > 0 || r.height > 0 || el.children.length > 0;
  };
  // The image a background draws (url() or image-set(), its sharpest), or none.
  const backgroundUrl = (cs) => {
    const urls = [...cs.backgroundImage.matchAll(/url\("?(.*?)"?\)\s*(?:([\d.]+)(?:x|dppx))?/g)];
    if (!urls.length || cs.backgroundImage.includes("gradient")) return null;
    return urls.sort((a, b) => Number(b[2] || 1) - Number(a[2] || 1))[0][1];
  };
  const font = (f) => {
    // next/font names its faces "__Inter_5d4f2a"; Paper knows them as "Inter".
    const first = f.split(",")[0].trim().replace(/^["']|["']$/g, "");
    const m = first.match(/^__(.+?)_[0-9a-f]{5,}$/);
    return m ? m[1].replace(/_/g, " ").replace(/ Fallback$/, "") : first;
  };
  const transparent = (c) => !c || c === "transparent" || /rgba\(.*,\s*0\)$/.test(c);
  const css = (s) =>
    Object.entries(s)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${v}`)
      .join("; ");
  const name = (el) =>
    el.getAttribute("data-slot") ||
    el.getAttribute("aria-label") ||
    el.getAttribute("data-testid") ||
    el.tagName.toLowerCase();

  function box(cs, s) {
    if (!transparent(cs.backgroundColor)) s.backgroundColor = cs.backgroundColor;
    if (cs.backgroundImage.includes("gradient")) s.backgroundImage = cs.backgroundImage;
    for (const side of SIDES) {
      const w = parseFloat(cs[`border${side}Width`]);
      if (w > 0 && cs[`border${side}Style`] !== "none")
        s[`border${side}`] = `${w}px ${cs[`border${side}Style`].replace(/inset|outset|groove|ridge/, "solid")} ${cs[`border${side}Color`]}`;
    }
    for (const c of ["TopLeft", "TopRight", "BottomRight", "BottomLeft"]) {
      const r = cs[`border${c}Radius`];
      if (r && r !== "0px") s[`border${c}Radius`] = r;
    }
    if (cs.boxShadow !== "none") s.boxShadow = cs.boxShadow;
    if (cs.opacity !== "1") s.opacity = cs.opacity;
    if (cs.overflow !== "visible" || cs.overflowX !== "visible") s.overflow = "hidden";
  }
  // "normal" line height depends on the font: measure a line of the element's text.
  function normalLine(el, cs) {
    const t = el && document.createTreeWalker(el, NodeFilter.SHOW_TEXT).nextNode();
    if (t && t.textContent.trim()) {
      const r = document.createRange();
      const i = t.textContent.search(/\S/);
      r.setStart(t, i);
      r.setEnd(t, i + 1);
      const h = r.getBoundingClientRect().height;
      if (h) return px(h);
    }
    return px(parseFloat(cs.fontSize) * 1.2);
  }
  function text(cs, s, el) {
    s.color = cs.color;
    s.fontFamily = font(cs.fontFamily);
    s.fontSize = cs.fontSize;
    s.fontWeight = cs.fontWeight;
    if (cs.fontStyle !== "normal") s.fontStyle = cs.fontStyle;
    s.lineHeight = cs.lineHeight === "normal" ? normalLine(el, cs) : cs.lineHeight;
    if (cs.letterSpacing !== "normal") s.letterSpacing = cs.letterSpacing;
    if (cs.textAlign !== "start" && cs.textAlign !== "left") s.textAlign = cs.textAlign;
    if (cs.textTransform !== "none") s.textTransform = cs.textTransform;
    if (cs.textDecorationLine !== "none") s.textDecoration = cs.textDecorationLine;
    if (cs.textOverflow === "ellipsis") s.textOverflow = "ellipsis";
    s.whiteSpace = cs.whiteSpace === "normal" ? "pre-wrap" : cs.whiteSpace;
  }
  const padding = (cs, s) => {
    for (const d of SIDES) if (cs[`padding${d}`] !== "0px") s[`padding${d}`] = cs[`padding${d}`];
  };
  const collapse = (cs, t) => (cs.whiteSpace.startsWith("pre") || cs.whiteSpace === "break-spaces" ? t : t.replace(/\s+/g, " "));

  // Inline content: text, <br>, and inline elements holding only inline content. Such an
  // element is one Paper text node, its formatted runs as styled spans.
  const isInline = (n) =>
    n.nodeType === 3 ||
    (n.nodeType === 1 &&
      (!visible(n) ||
        n.tagName === "BR" ||
        (!(n instanceof SVGElement) &&
          !["IMG", "INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(n.tagName) &&
          getComputedStyle(n).display === "inline" &&
          [...n.childNodes].every(isInline))));
  const RUN_STYLE = ["color", "fontWeight", "fontStyle", "fontSize", "fontFamily", "textDecorationLine", "letterSpacing"];
  function run(el, cs, ends) {
    let out = "";
    for (const n of el.childNodes) {
      if (n.nodeType === 3) {
        let t = collapse(cs, n.textContent);
        // The browser drops spaces at an end only where it collapses them: " notes" in a
        // white-space: pre span (a file name split before its last word) keeps its space.
        const kept = /^(pre|pre-wrap|break-spaces)$/.test(cs.whiteSpace);
        if (n === ends.first && !kept) t = t.trimStart();
        if (n === ends.last && !kept) t = t.trimEnd();
        out += esc(t);
      } else if (n.nodeType === 1 && visible(n)) {
        if (n.tagName === "BR") {
          out += "\n";
          continue;
        }
        const c = getComputedStyle(n);
        const s = {};
        for (const k of RUN_STYLE) if (c[k] !== cs[k]) s[k === "textDecorationLine" ? "textDecoration" : k] = k === "fontFamily" ? font(c[k]) : c[k];
        if (!transparent(c.backgroundColor)) s.backgroundColor = c.backgroundColor;
        const inner = run(n, c, ends);
        out += Object.keys(s).length ? `<span style="${attr(css(s))}">${inner}</span>` : inner;
      }
    }
    return out;
  }
  function textEnds(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let first = null;
    let last = null;
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue;
      first ??= n;
      last = n;
    }
    return { first, last };
  }

  function cut(el, cs, clip) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const cc = getComputedStyle(clip);
    const limit = clip.getBoundingClientRect().right - parseFloat(cc.paddingRight) - parseFloat(cc.borderRightWidth) - ctx.measureText("…").width;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let out = "";
    for (let n = w.nextNode(); n; n = w.nextNode())
      for (let i = 0; i < n.textContent.length; i++) {
        range.setStart(n, i);
        range.setEnd(n, i + 1);
        if (range.getBoundingClientRect().right > limit) return collapse(cs, out).trim() + "…";
        out += n.textContent[i];
      }
    return collapse(cs, out).trim();
  }

  // A text node beside other elements, split into its rendered lines, each placed where
  // it sits, so wrapped text keeps its wrap.
  function lines(n) {
    const t = n.textContent;
    const r = document.createRange();
    const out = [];
    let cur = null;
    const add = (start, end) => {
      r.setStart(n, start);
      r.setEnd(n, end);
      const b = r.getBoundingClientRect();
      const s = t.slice(start, end);
      if (!b.width && !b.height) {
        if (cur) cur.text += s;
        return;
      }
      if (!cur || Math.abs(b.top - cur.top) > b.height / 2) {
        cur = { left: b.left, top: b.top, right: b.right, bottom: b.bottom, text: s };
        out.push(cur);
      } else {
        cur.text += s;
        cur.left = Math.min(cur.left, b.left);
        cur.right = Math.max(cur.right, b.right);
        cur.bottom = Math.max(cur.bottom, b.bottom);
      }
    };
    // Word by word; a word the browser broke across lines, character by character.
    for (const m of t.matchAll(/\s*\S+\s*|\s+/g)) {
      r.setStart(n, m.index);
      r.setEnd(n, m.index + m[0].length);
      const rects = [...r.getClientRects()].filter((b) => b.width || b.height);
      const tops = new Set(rects.map((b) => Math.round(b.top)));
      if (tops.size > 1) for (let i = m.index; i < m.index + m[0].length; i++) add(i, i + 1);
      else add(m.index, m.index + m[0].length);
    }
    return out;
  }

  // Only element children in flow, laid out by flex alone (no margins, offsets, order,
  // align-self or transforms), and no loose text: then the container can keep its flex.
  function flowsAsFlex(el, cs) {
    if (!cs.display.includes("flex")) return false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) return false;
      if (n.nodeType !== 1 || !visible(n)) continue;
      const c = getComputedStyle(n);
      if (c.position === "absolute" || c.position === "fixed" || c.position === "sticky") return false;
      if (c.position === "relative" && SIDES.some((d) => !["auto", "0px"].includes(c[d.toLowerCase()]))) return false;
      if (SIDES.some((d) => parseFloat(c[`margin${d}`]) !== 0)) return false;
      if (c.order !== "0" || !["auto", "normal"].includes(c.alignSelf) || c.transform !== "none") return false;
    }
    return true;
  }

  function svg(el, cs, s, layer) {
    const r = el.getBoundingClientRect();
    const clone = el.cloneNode(true);
    clone.setAttribute("width", r.width);
    clone.setAttribute("height", r.height);
    // Fill and stroke often come from CSS classes, which don't travel: write them on.
    const from = [el, ...el.querySelectorAll("*")];
    const to = [clone, ...clone.querySelectorAll("*")];
    from.forEach((src, i) => {
      const c = getComputedStyle(src);
      const dst = to[i];
      // The computed values replace whatever the markup said, written only where they
      // differ from SVG's defaults: Paper drops a fill that has fill-opacity="1".
      for (const a of ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "fill-opacity", "opacity"])
        dst.removeAttribute(a);
      dst.setAttribute("fill", c.fill);
      if (c.stroke === "none") dst.setAttribute("stroke", "none");
      else {
        dst.setAttribute("stroke", c.stroke);
        dst.setAttribute("stroke-width", c.strokeWidth);
        if (c.strokeLinecap !== "butt") dst.setAttribute("stroke-linecap", c.strokeLinecap);
        if (c.strokeLinejoin !== "miter") dst.setAttribute("stroke-linejoin", c.strokeLinejoin);
        if (c.strokeOpacity !== "1") dst.setAttribute("stroke-opacity", c.strokeOpacity);
      }
      if (c.fillOpacity !== "1") dst.setAttribute("fill-opacity", c.fillOpacity);
      if (c.opacity !== "1") dst.setAttribute("opacity", c.opacity);
      if (c.display === "none") dst.setAttribute("display", "none");
      dst.removeAttribute("class");
      dst.removeAttribute("style");
    });
    const html = clone.outerHTML.replace(/currentColor/g, cs.color);
    return `<div layer-name="${layer}" style="${attr(css(s))}; display: flex">${html}</div>`;
  }

  function field(el, cs, s, layer) {
    if (el.type === "checkbox" || el.type === "radio") {
      const round = el.type === "radio";
      if (cs.appearance === "none") return `<div layer-name="${layer}" style="${attr(css(s))}"></div>`;
      // The browser draws native boxes itself, so draw one like it.
      const on = el.checked || el.indeterminate;
      const accent = cs.accentColor === "auto" ? "#0075ff" : cs.accentColor;
      Object.assign(s, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${on ? accent : "#767676"}`,
        borderRadius: round ? "50%" : "3px",
        backgroundColor: on && !round ? accent : "#ffffff",
      });
      const w = parseFloat(s.width);
      const mark = round
        ? on
          ? `<div style="width: ${px(w / 2)}; height: ${px(w / 2)}; border-radius: 50%; background-color: ${accent}"></div>`
          : ""
        : on
          ? `<span style="color: #ffffff; font-size: ${px(w * 0.8)}; line-height: ${px(w)}; font-family: Inter">${el.indeterminate ? "–" : "✓"}</span>`
          : "";
      return `<div layer-name="${layer}" style="${attr(css(s))}">${mark}</div>`;
    }
    let value = el.tagName === "SELECT" ? el.selectedOptions[0]?.text || "" : el.value;
    if (el.type === "password") value = "•".repeat(value.length);
    const shown = value || el.getAttribute("placeholder") || "";
    text(cs, s, el);
    if (!value) s.color = getComputedStyle(el, "::placeholder").color;
    s.display = "flex";
    s.alignItems = el.tagName === "TEXTAREA" ? "flex-start" : "center";
    for (const d of SIDES) s[`padding${d}`] = cs[`padding${d}`];
    return `<div layer-name="${layer}" style="${attr(css(s))}"><span>${esc(shown)}</span></div>`;
  }

  function node(el, origin, inFlow) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const s = {};
    if (!inFlow) {
      s.position = "absolute";
      s.left = px(r.left - origin.x);
      s.top = px(r.top - origin.y);
    } else {
      s.flexShrink = 0;
    }
    s.width = px(r.width);
    s.height = px(r.height);
    const layer = attr(name(el));

    // An svg that only frames a picture (<svg><image href="icon.webp"></svg>) is that picture.
    if (el instanceof SVGSVGElement) {
      const shown = [...el.querySelectorAll("*")].filter((e) => !(e instanceof SVGGElement) && !e.closest("defs") && getComputedStyle(e).display !== "none");
      if (shown.length === 1 && shown[0] instanceof SVGImageElement && shown[0].href.baseVal) {
        const i = images.push(new URL(shown[0].href.baseVal, document.baseURI).href) - 1;
        const ir = shown[0].getBoundingClientRect();
        Object.assign(s, { width: px(ir.width), height: px(ir.height), objectFit: "contain" });
        if (!inFlow) Object.assign(s, { left: px(ir.left - origin.x), top: px(ir.top - origin.y) });
        return `<img layer-name="${layer}" src="__IMAGE_${i}__" style="${attr(css(s))}">`;
      }
      return svg(el, cs, s, layer);
    }
    // A picture drawn as a background (an icon on a span): an image, or one behind the content.
    const bgUrl = backgroundUrl(cs);
    let backdrop = "";
    if (bgUrl) {
      const i = images.push(new URL(bgUrl, document.baseURI).href) - 1;
      const fitTo = cs.backgroundSize === "cover" ? "cover" : cs.backgroundSize === "contain" ? "contain" : "fill";
      if (![...el.childNodes].some((n) => (n.nodeType === 3 ? n.textContent.trim() : n.nodeType === 1 && visible(n)))) {
        box(cs, s);
        s.objectFit = fitTo;
        return `<img layer-name="${layer}" src="__IMAGE_${i}__" style="${attr(css(s))}">`;
      }
      backdrop = `<img layer-name="background" src="__IMAGE_${i}__" style="position: absolute; left: ${px(-parseFloat(cs.borderLeftWidth))}; top: ${px(-parseFloat(cs.borderTopWidth))}; width: ${px(r.width)}; height: ${px(r.height)}; object-fit: ${fitTo}">`;
    }
    if (el.tagName === "IMG" && el.currentSrc) {
      const i = images.push(el.currentSrc) - 1;
      box(cs, s);
      s.objectFit = cs.objectFit;
      return `<img layer-name="${layer}" src="__IMAGE_${i}__" style="${attr(css(s))}">`;
    }
    box(cs, s);
    if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return field(el, cs, s, layer);

    const kids = [...el.childNodes].filter((n) => (n.nodeType === 3 ? n.textContent.trim() : n.nodeType === 1 && visible(n)));
    // Inline content only: one Paper text node, with its formatting as spans.
    if (!backdrop && kids.length && [...el.childNodes].every(isInline)) {
      text(cs, s, el);
      padding(cs, s);
      if (cs.display.includes("flex")) {
        s.display = "flex";
        s.alignItems = cs.alignItems;
        s.justifyContent = cs.justifyContent;
      }
      // Paper clips text but draws no ellipsis: cut it where the browser did.
      // The ellipsis can be set on a wrapper of the element holding the text.
      let clip = el;
      for (let i = 0; clip && i < 3 && getComputedStyle(clip).textOverflow !== "ellipsis"; i++) clip = clip.parentElement;
      const cutHere = clip && getComputedStyle(clip).textOverflow === "ellipsis" && clip.scrollWidth > clip.clientWidth + 1;
      const body = cutHere ? esc(cut(el, cs, clip)) : run(el, cs, textEnds(el));
      return `<div layer-name="${layer}" style="${attr(css(s))}">${body}</div>`;
    }

    // Behind a background picture, the content is placed where it sits, over it.
    const flex = !backdrop && flowsAsFlex(el, cs);
    s.display = "flex";
    if (flex) {
      s.flexDirection = cs.flexDirection;
      if (cs.flexWrap !== "nowrap") s.flexWrap = cs.flexWrap;
      s.justifyContent = cs.justifyContent;
      s.alignItems = cs.alignItems;
      if (cs.rowGap !== "normal" && cs.rowGap !== "0px") s.rowGap = cs.rowGap;
      if (cs.columnGap !== "normal" && cs.columnGap !== "0px") s.columnGap = cs.columnGap;
      padding(cs, s);
    } else if (inFlow) {
      s.position = "relative";
    }
    // Absolute children are placed from the padding edge, inside the border.
    const inner = { x: r.left + parseFloat(cs.borderLeftWidth), y: r.top + parseFloat(cs.borderTopWidth) };
    const out = kids.flatMap((n) => {
      if (n.nodeType === 1) return [node(n, inner, flex)];
      return lines(n)
        .map((l) => ({ ...l, text: collapse(cs, l.text).trim() }))
        .filter((l) => l.text)
        .map((l) => {
          const ts = { position: "absolute", left: px(l.left - inner.x), top: px(l.top - inner.y), width: px(l.right - l.left + 1), height: px(l.bottom - l.top) };
          text(cs, ts, el);
          ts.whiteSpace = "pre";
          return `<span layer-name="text" style="${attr(css(ts))}">${esc(l.text)}</span>`;
        });
    });
    return `<div layer-name="${layer}" style="${attr(css(s))}">${backdrop}${out.join("")}</div>`;
  }

  const target = document.querySelector(selector);
  if (!target) throw new Error(`nothing matches ${selector}`);
  let bg = "#ffffff";
  for (let e = target; e; e = e.parentElement) {
    const c = getComputedStyle(e).backgroundColor;
    if (!transparent(c)) {
      bg = c;
      break;
    }
  }
  let parts;
  let bounds;
  if (fit) {
    // What the story draws: the root's children, and what it portals to the body (a menu,
    // a dialog), framed by what has ink (text, fills, borders, icons), not by a wrapper's width.
    const chrome = (e) =>
      e === target || e.contains(target) || /^storybook-/.test(e.id) || /\bsb-/.test(String(e.className)) || ["SCRIPT", "STYLE", "LINK", "TEMPLATE"].includes(e.tagName);
    let kids = [...target.children, ...[...document.body.children].filter((e) => !chrome(e))].filter(visible);
    // A modal open (a dialog or sheet, fixed over the window): the part is the modal, not the
    // page behind it with the button that opened it. A popover or menu keeps its trigger.
    const modals = kids
      .flatMap((k) => [k, ...k.querySelectorAll("[role=dialog], [role=alertdialog]")])
      .filter((e) => e.matches("[role=dialog], [role=alertdialog]") && getComputedStyle(e).position === "fixed" && visible(e));
    if (modals.length) kids = modals;
    const rs = [];
    const meet = (a, b) => {
      const m = { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) };
      return m.right > m.left && m.bottom > m.top ? m : null;
    };
    const keep = (r, clip) => {
      const m = meet(r, clip);
      if (m) rs.push(m);
    };
    const ink = (el, clip = { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 }) => {
      if (!visible(el)) return;
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      // A fixed element (a dialog's overlay) escapes its ancestors' clipping.
      if (c.position === "fixed") clip = { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 };
      const drawn =
        !transparent(c.backgroundColor) ||
        c.backgroundImage !== "none" ||
        c.boxShadow !== "none" ||
        SIDES.some((d) => parseFloat(c[`border${d}Width`]) > 0 && c[`border${d}Style`] !== "none") ||
        el instanceof SVGSVGElement ||
        ["IMG", "INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
      if (drawn && r.width && r.height) keep(r, clip);
      if (el instanceof SVGSVGElement) return;
      // What overflows a clipping box isn't seen, so it doesn't widen the frame.
      if (c.overflow !== "visible" || c.overflowX !== "visible") clip = meet(clip, r);
      if (!clip) return;
      for (const n of el.childNodes) {
        if (n.nodeType === 1) ink(n, clip);
        else if (n.nodeType === 3 && n.textContent.trim()) {
          const range = document.createRange();
          range.selectNodeContents(n);
          keep(range.getBoundingClientRect(), clip);
        }
      }
    };
    for (const k of kids) ink(k);
    if (!rs.length) throw new Error(`${selector} draws nothing`);
    bounds = {
      x: Math.min(...rs.map((r) => r.left)) - pad,
      y: Math.min(...rs.map((r) => r.top)) - pad,
      r: Math.max(...rs.map((r) => r.right)) + pad,
      b: Math.max(...rs.map((r) => r.bottom)) + pad,
    };
    parts = kids.map((k) => node(k, bounds, false));
  } else {
    const r = target.getBoundingClientRect();
    bounds = { x: r.left, y: r.top, r: r.right, b: r.bottom };
    parts = [node(target, bounds, false)];
  }
  return {
    html: parts.join(""),
    width: Math.ceil(bounds.r - bounds.x),
    height: Math.ceil(bounds.b - bounds.y),
    background: bg,
    images,
  };
}

// Waits, a bounded while, for what the page is still loading: images, fonts, and anything
// marked busy. A Storybook story also has to have rendered, and its error is thrown.
async function settle(storybook) {
  if (storybook) {
    await page.waitForSelector("body.sb-show-main, body.sb-show-errordisplay, body.sb-show-nopreview", { timeout: 15000 });
    const err = await page.evaluate(() =>
      document.body.classList.contains("sb-show-main") ? null : document.querySelector("#error-message, .sb-errordisplay")?.textContent?.trim() || "no story to show",
    );
    if (err) throw new Error(err);
  }
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete) && !document.querySelector('[aria-busy="true"]'), null, { timeout: 5000 })
    .catch(() => console.warn("  still loading after 5s; captured as it was"));
  await page.waitForTimeout(150);
}

// ---------- Running it ----------

const assets = join(tmpdir(), `to-paper-${Date.now()}`);
mkdirSync(assets, { recursive: true });
if (opt.out) mkdirSync(opt.out, { recursive: true });
// A grey pixel, in place of an image that couldn't be fetched.
const MISSING = join(assets, "missing.png");
writeFileSync(MISSING, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN4+P//fwAJdAPeVLYhXQAAAABJRU5ErkJggg==", "base64"));

const [vw, vh] = String(opt.viewport || "1440x900").split("x").map(Number);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: vw, height: vh },
  colorScheme: opt["color-scheme"] === "dark" ? "dark" : "light",
  deviceScaleFactor: 1,
  ...(opt["storage-state"] ? { storageState: opt["storage-state"] } : {}),
});
const page = await context.newPage();
const paper = opt["dry-run"] ? null : new Paper();
if (paper) await paper.start();

// What is on the page already, by name: replaced in place, moved, or (--prune) removed.
const existing = new Map();
if (paper) {
  // get_basic_info lists only the first 100 artboards; the page's tree summary names them all,
  // and get_node_info places the rest.
  const info = await paper.call("get_basic_info", { pageId: opt.page });
  for (const a of info.artboards || []) existing.set(a.name, a);
  if ((info.artboardCount ?? 0) > existing.size) {
    const { summary = "" } = await paper.call("get_tree_summary", { nodeId: info.rootNodeId || `root_node_${opt.page}`, depth: 1 });
    const known = new Set([...existing.values()].map((a) => a.id));
    for (const m of summary.matchAll(/^ {2}\S+ "(.*)" \(([^)\s]+)\) /gm)) {
      if (known.has(m[2])) continue;
      const n = await paper.call("get_node_info", { nodeId: m[2] });
      existing.set(m[1], { id: n.id, name: n.name, width: n.width, height: n.height, worldX: n.worldX, worldY: n.worldY });
    }
    if (existing.size < info.artboardCount) throw new Error(`found ${existing.size} of the page's ${info.artboardCount} artboards`);
  }
}

const counts = { made: 0, replaced: 0, same: 0, removed: 0, failed: 0, incomplete: 0 };
let shots;

// Downloads the page's images for Paper, as local files it can read. Their bytes go into
// the fingerprint, so a new image at the same URL counts as a change.
async function fetchImages(shot, key) {
  let html = shot.html;
  const hashes = [];
  let failed = 0;
  for (const [i, src] of shot.images.entries()) {
    let file = MISSING;
    try {
      let body;
      let type = "";
      if (src.startsWith("file:")) body = readFileSync(fileURLToPath(src));
      // The page's own files through the browser, which trusts a local proxy's certificate
      // (portless's https://<name>.localhost) where Node doesn't; others, past CORS, from Node.
      else if (src.startsWith("data:") || src.startsWith("blob:") || new URL(src).origin === new URL(page.url()).origin) {
        const url = await page.evaluate(async (u) => {
          const res = await fetch(u);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const b = await res.blob();
          return await new Promise((ok) => {
            const r = new FileReader();
            r.onload = () => ok(r.result);
            r.readAsDataURL(b);
          });
        }, src);
        type = url.slice(5, url.indexOf(";"));
        body = Buffer.from(url.slice(url.indexOf(",") + 1), "base64");
      } else {
        const res = await page.request.get(src);
        if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
        type = res.headers()["content-type"] || "";
        body = await res.body();
      }
      const ext = type.split("/")[1]?.split(/[;+]/)[0] || src.match(/\.(\w{3,4})(?:[?#]|$)/)?.[1] || "png";
      file = join(assets, `${key}-${i}.${ext}`);
      writeFileSync(file, body);
      hashes.push(createHash("sha1").update(body).digest("hex"));
    } catch (e) {
      failed++;
      hashes.push("missing");
      console.warn(`  image not copied (${e.message}): ${src.slice(0, 120)}`);
    }
    html = html.replaceAll(`__IMAGE_${i}__`, `paper-asset://${file}`);
  }
  return { html, hashes, failed };
}

async function grab(url, { selector, fit, storybook }) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  // A story drawn as wide as what it holds, not as the window: a wrapper with a fill (a band
  // of colour behind a button) would otherwise stretch its artboard across the screen. What
  // asks for the full width (a screen) still gets it: fit-content stops at the window.
  if (storybook) await page.addStyleTag({ content: `${selector}{width:fit-content!important}` });
  await settle(storybook);
  await page.waitForSelector(selector, { state: "attached" });
  const shot = await page.evaluate(capture, { selector, fit, pad: fit ? 24 : 0 });
  const { html, hashes, failed } = await fetchImages(shot, (shots = (shots || 0) + 1));
  shot.final = html;
  // An image that didn't copy leaves the capture incomplete: no fingerprint, so it's tried again.
  shot.incomplete = failed > 0;
  shot.print = createHash("sha1")
    .update(JSON.stringify([shot.html, shot.width, shot.height, shot.background, hashes]))
    .digest("hex")
    .slice(0, 12);
  return shot;
}

// Writes a capture as an artboard: a new one at `at`, or in place of `old`. The new one
// is made before the old one goes, so a failure leaves the old one there.
async function place(shot, name, { old, at }) {
  const html = shot.final ?? shot.html;
  if (opt.out) writeFileSync(join(opt.out, `${name.replace(/[^\w.-]+/g, "_")}.html`), html);
  if (!paper) {
    counts.made++;
    console.log(`made ${name} (${shot.width}×${shot.height})`);
    return;
  }
  const pos = at.left ? at : old ? { left: `${Math.round(old.worldX)}px`, top: `${Math.round(old.worldY)}px` } : at;
  const board = await paper.call("create_artboard", {
    pageId: opt.page,
    name,
    styles: { width: `${shot.width}px`, height: `${shot.height}px`, backgroundColor: shot.background, position: "relative", ...pos },
  });
  const id = board.id || board.nodeId || board.artboardId;
  if (!id) throw new Error(`create_artboard gave no id: ${JSON.stringify(board).slice(0, 200)}`);
  // Paper places a new artboard where it finds room; moving it is a style change after.
  if (pos.left) await paper.call("update_styles", { updates: [{ nodeIds: [id], styles: pos }] });
  try {
    await paper.call("write_html", { targetNodeId: id, mode: "insert-children", html });
  } catch (e) {
    await paper.call("delete_nodes", { nodeIds: [id] });
    throw e;
  }
  await paper.call("finish_working_on_nodes", { nodeIds: [id] });
  if (old) await paper.call("delete_nodes", { nodeIds: [old.id] });
  counts[old ? "replaced" : "made"]++;
  console.log(`${old ? "replaced" : "made"} ${name}`);
}

// The stamp: a summary line, and a line per story with its fingerprint.
async function readStamp(stampName) {
  const stamp = existing.get(stampName);
  if (!paper || !stamp) return new Map();
  // The stamp's text sits in one frame, inside the artboard.
  let list;
  for (let ids = [stamp.id], depth = 0; ids.length && !list && depth < 3; depth++) {
    const kids = [];
    for (const nodeId of ids) kids.push(...((await paper.call("get_children", { nodeId })).children || []));
    list = kids.find((c) => c.name === "fingerprints");
    ids = kids.filter((c) => c.childCount).map((c) => c.id);
  }
  if (!list) return new Map();
  const { textContent = "" } = await paper.call("get_node_info", { nodeId: list.id });
  return new Map(textContent.split("\n").filter(Boolean).map((l) => l.split(" ")));
}
async function writeStamp(stampName, prints, summary, at) {
  const old = existing.get(stampName);
  const lines = [...prints].sort(([a], [b]) => a.localeCompare(b)).map(([id, h]) => `${id} ${h}`);
  const html =
    `<div layer-name="summary" style="font-family: Inter; font-size: 16px; line-height: 22px; color: #111111; white-space: pre-wrap">${summary.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>` +
    `<div layer-name="fingerprints" style="font-family: Inter; font-size: 8px; line-height: 10px; color: #9a9a9a; white-space: pre">${lines.join("\n")}</div>`;
  const shot = { html, images: [], width: 640, height: 80 + lines.length * 10, background: "#ffffff" };
  // write_html needs room for it: a column, padded.
  shot.html = `<div style="position: absolute; left: 24px; top: 24px; display: flex; flex-direction: column; row-gap: 12px">${html}</div>`;
  await place(shot, stampName, { old, at });
  counts[old ? "replaced" : "made"]--;
}

try {
  if (mode === "page") {
    const name = opt.name || opt.url;
    const old = existing.get(name);
    if (old && !opt.replace) console.log(`skip ${name}: already on the page (pass --replace)`);
    else await place(await grab(opt.url, { selector: opt.selector || "body", fit: false }), name, { old, at: {} });
  } else {
    const base = String(opt.base || "http://localhost:6006").replace(/\/$/, "");
    // Through the browser, which trusts what the system does (a local proxy's certificate,
    // as portless's https://<name>.localhost), where Node's fetch wouldn't.
    const res = await page.goto(`${base}/index.json`);
    if (!res?.ok()) throw new Error(`${base}/index.json: HTTP ${res?.status()}`);
    const index = await res.json();
    const only = opt.only ? String(opt.only).split(",") : null;
    const all = Object.values(index.entries).filter((e) => e.type === "story" && !(e.tags || []).includes("no-paper"));
    // A title ("UI/Button"), a folder of titles ("UI"), or a story's id.
    const stories = all.filter((e) => !only || only.some((o) => e.title === o || e.title.startsWith(`${o}/`) || e.id === o));
    if (!stories.length) throw new Error(only ? `no story matches ${opt.only}` : "Storybook lists no stories");
    const globals = opt.globals ? `&globals=${encodeURIComponent(opt.globals).replace(/%3A/g, ":").replace(/%3B/g, ";")}` : "";
    const suffix = opt.suffix ?? "";
    const label = (s) => `${s.title} / ${s.name}${suffix}`;
    const ours = (n) => n.includes(" / ") && n.endsWith(suffix) && (suffix || !n.endsWith(" · dark"));
    const stampName = `Synced${suffix}`;
    const prints = await readStamp(stampName);

    // --prune: an artboard for a story that's no longer in the index goes.
    if (paper && opt.prune) {
      const names = new Set(all.map(label));
      const gone = [...existing.values()].filter((a) => ours(a.name) && !names.has(a.name));
      if (gone.length) await paper.call("delete_nodes", { nodeIds: gone.map((a) => a.id) });
      for (const a of gone) {
        existing.delete(a.name);
        console.log(`removed ${a.name}`);
      }
      counts.removed = gone.length;
      const ids = new Set(all.map((s) => s.id));
      for (const id of prints.keys()) if (!ids.has(id)) prints.delete(id);
    }

    // One row per component, its stories left to right, 80px apart, the rows in the index's
    // order, laid out afresh each run: an artboard that changed size moves its neighbours
    // along rather than leaving a gap or overlapping them. With --only, a row keeps its place.
    // A run with a suffix (dark) goes below what's on the page that isn't its own.
    const rows = new Map();
    for (const s of stories) rows.set(s.title, [...(rows.get(s.title) || []), s]);
    const boards = [...existing.values()].filter((a) => a.worldY != null && a.name !== stampName);
    const others = boards.filter((a) => !ours(a.name));
    const top = Number(opt.top || 200);
    let y = suffix && others.length ? Math.max(...others.map((a) => a.worldY + a.height)) + 160 : top;
    if (only) y = boards.length ? Math.max(...boards.map((a) => a.worldY + a.height)) + 160 : top;
    for (const [title, row] of rows) {
      const mine = boards.filter((a) => a.name.startsWith(`${title} / `) && ours(a.name));
      const rowY = only && mine.length ? Math.min(...mine.map((a) => a.worldY)) : y;
      let x = 0;
      let tallest = 0;
      for (const s of row) {
        const name = label(s);
        try {
          const shot = await grab(`${base}/iframe.html?id=${encodeURIComponent(s.id)}&viewMode=story${globals}`, {
            selector: "#storybook-root",
            fit: true,
            storybook: true,
          });
          const old = existing.get(name);
          const at = { left: `${x}px`, top: `${rowY}px` };
          if (old && prints.get(s.id) === shot.print && !opt.force) {
            counts.same++;
            if (paper && (Math.round(old.worldX) !== x || Math.round(old.worldY) !== rowY))
              await paper.call("update_styles", { updates: [{ nodeIds: [old.id], styles: at }] });
          } else await place(shot, name, { old, at });
          x += shot.width + 80;
          if (shot.incomplete) {
            counts.incomplete++;
            prints.delete(s.id);
          } else prints.set(s.id, shot.print);
          tallest = Math.max(tallest, shot.height);
        } catch (e) {
          counts.failed++;
          prints.delete(s.id);
          console.error(`FAILED ${name}: ${e.message.split("\n")[0]}`);
        }
      }
      if (!(only && mine.length)) y += tallest + 160;
    }

    // Only a run that captured every story without a failure says the page matches a commit.
    const full = !only && !counts.failed && !counts.incomplete;
    const date = new Date().toISOString().slice(0, 10);
    const summary = full
      ? `Synced${opt.commit ? ` from ${opt.commit}` : ""} on ${date}, ${all.length} stories`
      : `Partly synced on ${date}: some stories may be behind. A full sync (no --only, no failures, every image copied) sets the commit.`;
    if (paper) {
      const minY = Math.min(top, ...[...existing.values()].filter((a) => a.name !== stampName).map((a) => a.worldY));
      await writeStamp(stampName, prints, summary, { left: "0px", top: `${minY - 80 - 10 * prints.size - 120}px` });
    }
    console.log(summary);
  }
} catch (e) {
  console.error(`to-paper: ${e.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  paper?.stop();
}
if (counts.failed) process.exitCode = 1;
console.log(
  `${counts.made} made, ${counts.replaced} replaced, ${counts.same} unchanged, ${counts.removed} removed, ${counts.failed} failed` +
    (counts.incomplete ? `, ${counts.incomplete} with images missing` : "") +
    (opt.out ? `; HTML in ${opt.out}` : ""),
);
