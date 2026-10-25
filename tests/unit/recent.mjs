// Repliche pure del modulo Recent in content.js
let recentCache = [];
const persistRecentCache = () => {};
const renderRecentIfVisible = () => {};
function normalizeUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}
const RECORD_MAX = 100;
function recordRecentChatVisit(details) {
  const url = normalizeUrl(details.url);
  if (!url) return;
  const existingIdx = recentCache.findIndex((r) => normalizeUrl(r.url || "") === url);
  const ts = details.__ts || "2026-10-25T10:00:00.000Z";
  if (existingIdx >= 0) {
    const existing = recentCache.splice(existingIdx, 1)[0];
    recentCache.unshift(Object.assign({}, existing, {
      name: details.name || existing.name,
      platform: details.platform || existing.platform,
      lastVisitedAt: ts,
      visitCount: (existing.visitCount || 1) + 1
    }));
  } else {
    recentCache.unshift({
      url,
      name: details.name || "Chat",
      platform: details.platform || "Generico",
      lastVisitedAt: ts,
      firstVisitedAt: ts,
      visitCount: 1
    });
  }
  if (recentCache.length > RECORD_MAX) recentCache.length = RECORD_MAX;
}
function deleteRecentEntry(url) {
  const target = normalizeUrl(url);
  recentCache = recentCache.filter((r) => normalizeUrl(r.url || "") !== target);
}
function formatRecentRelative(ts, now) {
  const then = new Date(ts).getTime();
  if (isNaN(then)) return "";
  const min = Math.floor((now - then) / 60000);
  if (min < 1) return "Adesso";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}g`;
  return new Date(ts).toLocaleDateString();
}
function bucketRecentByAge(recentCache, now) {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const todayMs = startOfDay.getTime();
  const weekMs = todayMs - 7 * 86400000;
  const buckets = { today: [], week: [], older: [] };
  recentCache.forEach((r) => {
    const ts = new Date(r.lastVisitedAt).getTime();
    if (isNaN(ts)) {
      buckets.older.push(r);
      return;
    }
    if (ts >= todayMs) buckets.today.push(r);
    else if (ts >= weekMs) buckets.week.push(r);
    else buckets.older.push(r);
  });
  return buckets;
}

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// Visite: nuova e poi riveduta
recentCache = [];
recordRecentChatVisit({ url: "https://chatgpt.com/c/abc", name: "Chat A", platform: "ChatGPT", __ts: "2026-10-25T09:00:00.000Z" });
t("prima visita registrata", recentCache.length === 1 && recentCache[0].name === "Chat A");
t("campi visit settati", recentCache[0].visitCount === 1 && !!recentCache[0].firstVisitedAt);
recordRecentChatVisit({ url: "https://chatgpt.com/c/abc", name: "", platform: "ChatGPT", __ts: "2026-10-25T10:00:00.000Z" });
t("riveduta: no duplicato", recentCache.length === 1);
t("riveduta: count=2", recentCache[0].visitCount === 2);
t("riveduta: nome conservato", recentCache[0].name === "Chat A");
t("riveduta: lastVisited aggiornato", recentCache[0].lastVisitedAt === "2026-10-25T10:00:00.000Z");

// Primo in lista: la seconda chat arriva sopra
recordRecentChatVisit({ url: "https://gemini.google.com/app/x", name: "Chat B", platform: "Gemini", __ts: "2026-10-25T10:30:00.000Z" });
t("nuova attività in testa", recentCache[0].name === "Chat B");
t("ordine LRU", recentCache[1].name === "Chat A");

// Rivedere la prima la troduce in testa (move-to-front)
recordRecentChatVisit({ url: "https://chatgpt.com/c/abc", __ts: "2026-10-25T11:00:00.000Z" });
t("move-to-front", recentCache[0].name === "Chat A" && recentCache[0].visitCount === 3);

// URL normalizzazione (trailing slash)
t("url normalizzato come chiave", normalizeUrl("https://x.com/y/") === "https://x.com/y");
recordRecentChatVisit({ url: "https://gemini.google.com/app/x/", __ts: "2026-10-25T11:10:00.000Z" });
t("slash finale non duplica", recentCache.length === 2 && recentCache[0].name === "Chat B");

// Difetto: url vuota non registra
const len = recentCache.length;
recordRecentChatVisit({ url: "", name: "Z" });
t("url vuota ignora", recentCache.length === len);

// Definisce max 100
recentCache = [];
for (let i = 0; i < 105; i++) recordRecentChatVisit({ url: "https://x.com/c/" + i, name: "C" + i, __ts: "2026-10-25T09:00:00.000Z" });
t("cap 100", recentCache.length === 100);
t("restano le più recenti", recentCache[0].name === "C104" && recentCache[99].name === "C5");

// Delete
recentCache = [
  { url: "https://x.com/c/1", name: "A", lastVisitedAt: "2026-10-25T09:00:00Z" },
  { url: "https://x.com/c/2", name: "B", lastVisitedAt: "2026-10-25T09:00:00Z" }
];
deleteRecentEntry("https://x.com/c/1");
t("delete rimuove", recentCache.length === 1 && recentCache[0].name === "B");
deleteRecentEntry("https://x.com/c/1/");
t("delete url normalizzata safe", recentCache.length === 1);

// Relativo
const NOW = new Date("2026-10-25T12:00:00.000Z").getTime();
t("adesso", formatRecentRelative("2026-10-25T12:00:00.000Z", NOW) === "Adesso");
t("minuti", formatRecentRelative("2026-10-25T11:45:00.000Z", NOW) === "15 min");
t("ore", formatRecentRelative("2026-10-25T09:00:00.000Z", NOW) === "3h");
t("giorni", formatRecentRelative("2026-10-23T12:00:00.000Z", NOW) === "2g");
t("più di 7gg = data", formatRecentRelative("2026-10-10T12:00:00.000Z", NOW) === new Date("2026-10-10T12:00:00.000Z").toLocaleDateString());
t("timestamp valido ma errato = stringa vuota", formatRecentRelative("not-a-date", NOW) === "");

// Bucket
recentCache = [
  { url: "a", lastVisitedAt: "2026-10-25T09:00:00Z" }, // oggi (mezzanotte locale 25/10)
  { url: "b", lastVisitedAt: "2026-10-21T09:00:00Z" }, // questa settimana
  { url: "c", lastVisitedAt: "2026-10-01T09:00:00Z" }, // più vecchia
  { url: "d", lastVisitedAt: "not-a-date" } // errata
];
const b = bucketRecentByAge(recentCache, new Date("2026-10-25T12:00:00.000Z").getTime());
t("bucket oggi", b.today.length === 1);
t("bucket settimana", b.week.length === 1);
t("bucket vecchie (sia 01/10 che invalida)", b.older.length === 2);

console.log(pass + " passed, " + fail + " failed");
