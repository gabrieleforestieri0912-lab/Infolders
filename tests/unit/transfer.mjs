// Repliche pure del modulo transfer in content.js
function collapseText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}
function normalizeMessageText(text) {
  return String(text || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
function closestTag(el, sel) {
  // stub del closest per test (selettori semplici tag)
  let cur = el && el.parent;
  while (cur) {
    if (cur.tagName.toLowerCase() === sel) return cur;
    cur = cur.parent;
  }
  return null;
}
function detectMessageRole(el, closest) {
  try {
    const attr = el.getAttribute("data-message-author-role") || el.getAttribute("data-role") || el.getAttribute("data-author");
    if (attr) {
      const a = String(attr).toLowerCase();
      if (a === "user" || a === "human") return "user";
      if (a === "assistant" || a === "model" || a === "ai" || a === "bot") return "assistant";
    }
    const testid = String(el.getAttribute("data-testid") || el.getAttribute("data-test") || "");
    if (testid) {
      if (/user|human|query/i.test(testid)) return "user";
      if (/assistant|bot|model/i.test(testid)) return "assistant";
    }
    const tag = el.tagName.toLowerCase();
    if (tag === "user-query" || tag === "query-content") return "user";
    if (tag === "model-response" || tag === "response-container-content") return "assistant";
    if (closest("user-query")) return "user";
    if (closest("model-response")) return "assistant";
    const cls = typeof el.className === "string" ? el.className : "";
    if (/user-message/i.test(cls)) return "user";
    if (/claude-response|response-container/i.test(cls)) return "assistant";
    if (/font-claude-message/i.test(cls) && !closest('[data-testid="user-message"]')) return "assistant";
  } catch {
  }
  return "";
}
function buildTransferMarkdown(details, messages, nowIso) {
  const lines = [];
  lines.push(`# ${collapseText(details.name || "Chat")}`);
  lines.push("");
  lines.push(`> Conversazione trasferita con InFolders il ${nowIso}`);
  lines.push(`> Origine: ${details.platform || "Piattaforma"} — ${details.url}`);
  lines.push("");
  messages.forEach((m) => {
    if (m.role === "user") lines.push("**Utente:**");
    else if (m.role === "assistant") lines.push("**Assistente:**");
    lines.push(m.text);
    lines.push("");
  });
  return lines.join("\n");
}
function sanitizeTransferFilename(name) {
  let base = collapseText(name || "chat").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return (base || "chat") + ".md";
}

// mock element helper
const mkEl = ({ tag = "div", attrs = {}, className = "", text = "", parent = null, innerText = text }) => ({
  tagName: tag.toUpperCase(),
  className,
  textContent: text,
  innerText,
  parent,
  getAttribute(k) { return attrs[k] != null ? attrs[k] : null; },
  contains(other) {
    let cur = other;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parent;
    }
    return false;
  }
});

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// detectMessageRole
let curEl = null;
let actorEl = null;
const closestStub = (sel) => closestTag(actorEl, sel);

// detectMessageRole
let el = mkEl({ attrs: { "data-message-author-role": "user" } });
actorEl = el;
t("chatgpt attr user", detectMessageRole(el, closestStub) === "user");
el = mkEl({ attrs: { "data-message-author-role": "assistant" } });
actorEl = el;
t("chatgpt attr assistant", detectMessageRole(el, closestStub) === "assistant");
el = mkEl({ attrs: { "data-testid": "user-message" } });
actorEl = el;
t("claude testid user", detectMessageRole(el, closestStub) === "user");
el = mkEl({ className: "font-claude-response" });
actorEl = el;
t("claude class response", detectMessageRole(el, closestStub) === "assistant");
el = mkEl({ tag: "user-query" });
actorEl = el;
t("gemini tag user-query", detectMessageRole(el, closestStub) === "user");
el = mkEl({ tag: "model-response" });
actorEl = el;
t("gemini tag model-response", detectMessageRole(el, closestStub) === "assistant");
function closestAttr(node, sel) {
  let cur = node.parent;
  const m = sel.match(/^\[([^=~\]]+)(?:="([^"]*)")?\]$/);
  const attr = m ? m[1] : null;
  const val = m ? (m[2] || null) : null;
  const tagName = m ? null : sel;
  while (cur) {
    if (tagName ? cur.tagName.toLowerCase() === tagName : String(cur.getAttribute(attr) == null ? "" : cur.getAttribute(attr)) === (val != null ? val : "")) return cur;
    cur = cur.parent;
  }
  return null;
}
// annidato: query-content dentro user-query
const uq = mkEl({ tag: "user-query" });
el = mkEl({ tag: "div", parent: uq });
actorEl = el;
t("gemini annidato closest", detectMessageRole(el, (s) => closestTag(el, s)) === "user");
// annidato: font-claude-message dentro [data-testid=user-message] → non assistant
const claudeUser = mkEl({ attrs: { "data-testid": "user-message" }, className: "" });
const claudeInner = mkEl({ parent: claudeUser, className: "font-claude-message" });
el = claudeInner;
actorEl = el;
t("claude annidato → non assistant", detectMessageRole(el, (s) => closestAttr(el, s)) !== "assistant");
// grok: nessun indizio → ""
el = mkEl({ attrs: { "data-message-id": "abc" } });
actorEl = el;
t("grok indefinito = ''", detectMessageRole(el, closestStub) === "");
// eccezione → ""
t("null safe", detectMessageRole(null, closestStub) === "");

// normalizeMessageText
t("blank line collapse", normalizeMessageText("a\n\n\n\n\nb") === "a\n\nb");
t("cr strip", normalizeMessageText("a\r\nb") === "a\nb");
t("trim", normalizeMessageText("  x  ") === "x");
t("mantieni paragrafi", normalizeMessageText("par1\n\npar2") === "par1\n\npar2");

// buildTransferMarkdown
const md = buildTransferMarkdown({ name: "Setup CI", platform: "ChatGPT", url: "https://chatgpt.com/c/x" }, [
  { role: "user", text: "Come configuro CI?" },
  { role: "assistant", text: "Ecco come...\n\npasso 1" },
  { role: "", text: "senza ruolo" }
], "2026-10-25T10:00:00.000Z");
t("header titolo", md.startsWith("# Setup CI\n"));
t("header nota", md.includes("> Conversazione trasferita con InFolders il 2026-10-25T10:00:00.000Z"));
t("header fonte", md.includes("> Origine: ChatGPT — https://chatgpt.com/c/x"));
t("label utente", md.includes("**Utente:**\nCome configuro CI?"));
t("label assistente", md.includes("**Assistente:**\nEcco come..."));
t("senza ruolo = testo puro", md.includes("\nsenza ruolo\n"));
t("ordine preserved", md.indexOf("Come configuro") < md.indexOf("Ecco come"));
t("piattaforma mancante safe", buildTransferMarkdown({ url: "u" }, [], "ts").includes("> Origine: Piattaforma — u"));
t("titolo mancante safe", buildTransferMarkdown({ url: "u" }, [], "ts").startsWith("# Chat"));

// sanitize filename
t("filename semplice", sanitizeTransferFilename("Setup CI") === "Setup-CI.md");
t("filename emoticon/ slash", sanitizeTransferFilename("Fix: bug / 💥!!") === "Fix-bug.md");
t("filename vuoto default", sanitizeTransferFilename("") === "chat.md");
t("filename lungo troncato", sanitizeTransferFilename("x".repeat(100)).length <= 64);

// dedup logica extractCurrentConversation (nidificazione)
function extractCurrentConversationMock(queryAll) {
  const candidates = queryAll();
  if (!candidates.length) return [];
  candidates.sort((a, b) => (a.compareDocumentPosition(b) & 4) ? -1 : 1);
  const picked = [];
  const messages = [];
  for (const e of candidates) {
    if (picked.some((p) => p.contains(e))) continue;
    picked.push(e);
    const text = normalizeMessageText(e.innerText != null ? e.innerText : e.textContent || "");
    if (!text) continue;
    messages.push({ role: detectMessageRole(e, (s) => closestTag(e, s)), text });
  }
  return messages;
}
// Document order: outer(0) < inner(1) < another(2)
const order = new Map();
const outer = mkEl({ className: "conversation-turn", text: "user: dove vado?", innerText: "user: dove vado?" });
const inner = mkEl({ attrs: { "data-message-author-role": "user" }, parent: outer, className: "md", text: "dove vado?", innerText: "dove vado?" });
const another = mkEl({ attrs: { "data-message-author-role": "assistant" }, text: "sei in Laghi di Fusine", innerText: "sei in Laghi di Fusine" });
[outer, inner, another].forEach((e, i) => {
  order.set(e, i);
  e.compareDocumentPosition = (other) => (order.get(e) < order.get(other) ? 4 : 2);
});
const res = extractCurrentConversationMock(() => [outer, inner, another]);
t("nidificato dedup", res.length === 2 && res[0].text.includes("dove vado?") && res[1].role === "assistant");

console.log(pass + " passed, " + fail + " failed");
