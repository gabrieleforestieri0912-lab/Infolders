import fs from "node:fs";
const src = fs.readFileSync(new URL("../../extension/static/content.js", import.meta.url), "utf8");
const lines = src.split("\n");

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// 1) Chiavi usate via t("...") devono comparire come "key" almeno 2 volte (dict it + en)
const usedKeys = new Set();
for (const m of src.matchAll(/\bt\("([a-z][a-z0-9._-]+)"/g)) usedKeys.add(m[1]);
t("chiavi usate trovate (>50)", usedKeys.size > 50);
for (const key of usedKeys) {
  const re = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g");
  const count = (src.match(re) || []).length;
  if (count < 2) { fail++; console.log("FAIL: chiave non in entrambi i dict:", key, "(" + count + ")"); }
  else pass++;
}

// 2) Zona dict trovata dinamicamente: da "var LANGUAGES = {" fino a "function t(key"
let dictStart = lines.findIndex((l) => l.includes("var LANGUAGES = {"));
let dictEnd = lines.findIndex((l) => l.includes("function t(key"));
t("delimitatori dict trovati", dictStart >= 0 && dictEnd > dictStart);
const inDictZone = (i) => i >= dictStart && i <= dictEnd;

// Stringhe dei moduli NUOVI: zero tolleranza
const leftovers = [
  "Apri una chat per trasferirla", "Nessun messaggio trovato", "spostata in", "Non puoi spostare",
  "Errore nello spostamento", "Chat aggiunta a", "Aggiungi chat a una cartella",
  "Nessuna chat visitata", "Più vecchie",
  "Aggiungi ai bookmark", "Rimuovi dai recenti",
  "Trasferisci conversazione", "messaggi estratti", "(origine)", "Scarica come .md",
  "Conversazione scaricata", "Download non riuscito", "Conversazione copiata", "Conversazione inserita",
  "Campo non trovato", "Trasferimento annullato", "Tab non apribile",
  "Completa il prompt", "Compila le variabili", "Usa nel campo", "Prompt inserito",
  "Libreria prompt", "Nel testo delle chat", "chat aperta",
  "Trascina su un'altra cartella"
];

// Stringhe note della UI VECCHIA, deferite al sweep follow-up: accettate solo
// in contesti sorgente stabili (match per contesto, non per numero di riga,
// che si sposta a ogni modifica del bundle).
const deferredKnown = {
  "Cerca prompt...": ['id="prompt-search"'],
  "Copia": ['class="prompt-copy"'],
  "Prompt copiato": ["showToast("],
  "Crea prima una cartella": ["showToast("],
  "Aggiungi a una cartella": ["title.textContent", "addBtn.title"]
};

for (let i = 0; i < lines.length; i++) {
  if (inDictZone(i)) continue;
  const line = lines[i];
  for (const phrase of leftovers) {
    if (line.includes(phrase)) {
      fail++;
      console.log(`FAIL: leftover "${phrase}" a riga ${i + 1}: ${line.trim().slice(0, 110)}`);
    }
  }
  for (const [phrase, contexts] of Object.entries(deferredKnown)) {
    if (line.includes(phrase) && !contexts.some((c) => line.includes(c))) {
      fail++;
      console.log(`FAIL: leftover deferito "${phrase}" in contesto inatteso a riga ${i + 1}: ${line.trim().slice(0, 110)}`);
    }
  }
}
t("stringhe deferite presenti solo nei contesti noti", true);

console.log(pass + " passed, " + fail + " failed");
