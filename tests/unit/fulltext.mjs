// Repliche pure del modulo full-text in content.js
function normalizeSearchText(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}
function normalizeUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}
const FULLTEXT_MAX_CHATS = 20;
const FULLTEXT_MAX_CHAT_CHARS = 100000;
let fulltextCache = [];
function archiveCountsMessages(trimmed) {
  let total = 0;
  trimmed.forEach((m) => { total += (m.text || "").length; });
  return total;
}
function archiveCurrentConversationExtract(details, messages) {
  const trimmed = [];
  for (const m of messages) {
    const text = normalizeSearchText(m.text).slice(0, FULLTEXT_MAX_CHAT_CHARS);
    if (!text) continue;
    trimmed.push({ role: m.role, text });
    if (archiveCountsMessages(trimmed) > FULLTEXT_MAX_CHAT_CHARS) {
      trimmed.pop();
      break;
    }
  }
  if (!trimmed.length) return;
  const url = normalizeUrl(details.url);
  const ts = details.__ts || "2026-10-25T10:00:00.000Z";
  const idx = fulltextCache.findIndex((e) => normalizeUrl(e.url || "") === url);
  const existing = idx >= 0 ? fulltextCache[idx] : null;
  if (existing && (existing.messages || []).length >= trimmed.length) {
    existing.name = details.name || existing.name;
    existing.lastVisitedAt = ts;
  } else {
    if (idx >= 0) fulltextCache.splice(idx, 1);
    fulltextCache.unshift({
      url,
      name: details.name || "Chat",
      platform: details.platform || "Generico",
      messages: trimmed,
      lastVisitedAt: ts
    });
  }
  if (fulltextCache.length > FULLTEXT_MAX_CHATS) fulltextCache.length = FULLTEXT_MAX_CHATS;
}
function searchFullTextIndex(query, platformFilter, filterState) {
  const q = normalizeSearchText(query);
  if (!q || q.length < 2) return [];
  const filter = platformFilter || (filterState || "all");
  const out = [];
  for (const entry of fulltextCache) {
    if (filter !== "all" && normalizeSearchText(entry.platform || "") !== normalizeSearchText(filter)) continue;
    for (const message of (entry.messages || [])) {
      const hay = normalizeSearchText(message.text);
      const pos = hay.indexOf(q);
      if (pos === -1) continue;
      const start = Math.max(0, pos - 45);
      const end = Math.min(hay.length, pos + q.length + 65);
      out.push({
        url: entry.url,
        name: entry.name,
        platform: entry.platform,
        lastVisitedAt: entry.lastVisitedAt,
        snippetStart: start,
        snippetHitStart: pos - start,
        snippetHitEnd: pos - start + q.length,
        snippet: (start > 0 ? "…" : "") + hay.slice(start, end) + (end < hay.length ? "…" : "")
      });
      if (out.length >= 20) return out;
    }
  }
  return out;
}
function fullTextPlatformBadges(results) {
  const counts = new Map();
  results.forEach((r) => {
    const p = r.platform || "Generico";
    counts.set(p, (counts.get(p) || 0) + 1);
  });
  return [...counts.keys()];
}

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// Archiviazione
fulltextCache = [];
archiveCurrentConversationExtract(
  { url: "https://chatgpt.com/c/1", name: "Pianificazione Q4", platform: "ChatGPT" },
  [{ role: "user", text: "Come ripartiamo il budget marketing Q4?" }, { role: "assistant", text: "Propongo 40% social, 30% search, 30% brand." }]
);
archiveCurrentConversationExtract(
  { url: "https://claude.ai/chat/2", name: "Debug Node", platform: "Claude" },
  [{ role: "user", text: "il server crasha su SIGTERM" }, { role: "assistant", text: "gestisci il segnale con process.on('SIGTERM')" }]
);
t("due chat archiviate", fulltextCache.length === 2);
t("testo normalizzato minuscolo", fulltextCache[1].messages[0].text === "come ripartiamo il budget marketing q4?");
t("nuove chat in testa", fulltextCache[0].platform === "Claude");

// Ricerca (prima delle archiviazioni successive che aranno il contenuto)
t("match frase", searchFullTextIndex("budget marketing").length === 1);
t("case-insensitive", searchFullTextIndex("BUDGET").length === 1);
t("query corte ignorata", searchFullTextIndex("a").length === 0);
t("nessun match", searchFullTextIndex("quantistica").length === 0);
t("match solo nella seconda chat", searchFullTextIndex("SIGTERM", "all").every((r) => r.platform === "Claude"));
const r = searchFullTextIndex("budget marketing")[0];
t("snippet contiene hit", r.snippet.includes("budget marketing"));
t("posizioni coerenti", r.snippet.slice(r.snippetHitStart, r.snippetHitEnd).includes("budget marketing"));
t("snippet ellipsis se contenuto lungo", (() => {
  fulltextCache = [{ url: "u", name: "n", platform: "p", lastVisitedAt: "ts", messages: [{ role: "user", text: "parola ".repeat(50) + "termine speciale finale " + "altra ".repeat(50) }] }];
  const r = searchFullTextIndex("termine speciale")[0];
  return r.snippet.startsWith("…") && r.snippet.endsWith("…");
})());

// Identificato: archivia di nuovo con MENO messaggi → non sovra-scrive
fulltextCache = [];
archiveCurrentConversationExtract(
  { url: "https://chatgpt.com/c/1", name: "Pianificazione Q4", platform: "ChatGPT" },
  [{ role: "user", text: "A" }, { role: "assistant", text: "B" }]
);
archiveCurrentConversationExtract(
  { url: "https://chatgpt.com/c/1/", name: "Pianificazione Q4", platform: "ChatGPT", __ts: "2026-10-25T11:00:00.000Z" },
  [{ role: "user", text: "solo un messaggio visibile" }]
);
t("ridotto non sovra-scrive il maggiore", fulltextCache.find((e) => e.url === "https://chatgpt.com/c/1").messages.length === 2);
t("url trailing slash non duplica", fulltextCache.length === 1);

// Poi con PIÙ messaggi → aggiorna (replace)
archiveCurrentConversationExtract(
  { url: "https://chatgpt.com/c/1", name: "Pianificazione Q4", platform: "ChatGPT", __ts: "2026-10-25T12:00:00.000Z" },
  [{ role: "user", text: "m1" }, { role: "assistant", text: "m2" }, { role: "user", text: "m3" }]
);
t("risultato più ricco sostituisce", fulltextCache.find((e) => e.url === "https://chatgpt.com/c/1").messages.length === 3);

// filtro piattaforma
fulltextCache = [];
archiveCurrentConversationExtract({ url: "https://a", name: "A", platform: "ChatGPT" }, [{ role: "user", text: "parola chiave qui" }]);
archiveCurrentConversationExtract({ url: "https://b", name: "B", platform: "Grok" }, [{ role: "user", text: "parola chiave anche qui" }]);
t("filtro ChatGPT", searchFullTextIndex("parola chiave", "ChatGPT").every((x) => x.platform === "ChatGPT"));
t("filtro Grok", searchFullTextIndex("parola chiave", "Grok").length === 1);
t("senza filtro entrambe", searchFullTextIndex("parola chiave", "all").length === 2);

// perchées badge
const badges = fullTextPlatformBadges(searchFullTextIndex("parola chiave", "all"));
t("badge due piattaforme", badges.length === 2 && badges.includes("ChatGPT") && badges.includes("Grok"));
t("badge singola piattaforma", fullTextPlatformBadges(searchFullTextIndex("parola chiave", "ChatGPT")).length === 1);

// cap 20 risultati
fulltextCache = [];
for (let i = 0; i < 30; i++) {
  archiveCurrentConversationExtract({ url: "https://x/c/" + i, name: "C" + i, platform: "ChatGPT" }, [{ role: "user", text: "parola chiave in " + i }]);
}
t("cap 20 risultati", searchFullTextIndex("parola chiave", "all").length === 20);
t("cap 20 chat", fulltextCache.length === 20);

// query trim
t("query con spazi ok", searchFullTextIndex("  parola   chiave ", "all").length > 0);

console.log(pass + " passed, " + fail + " failed");
