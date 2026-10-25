// Repliche pure di content.js (extractPromptVariables / applyPromptVariables)
var PROMPT_VAR_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9 _-]*?)\s*\}\}/g;
function extractPromptVariables(text) {
  const out = [];
  const seen = new Set();
  String(text || "").replace(PROMPT_VAR_PATTERN, (_m, name) => {
    const n = String(name).trim();
    if (n && !seen.has(n)) { seen.add(n); out.push(n); }
    return _m;
  });
  return out;
}
function applyPromptVariables(text, values) {
  return String(text || "").replace(PROMPT_VAR_PATTERN, (_m, name) => {
    const v = values && values[String(name).trim()];
    return v == null ? "" : String(v);
  });
}

let pass = 0, fail = 0;
function t(label, cond) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.log("FAIL:", label);
  }
}

// Estrazione: variabili uniche, in ordine, con spazi
let vars = extractPromptVariables("Riassumi {{articolo}} in {{ lingua }} per {{CB_persona}}");
t("estratte 3 variabili", vars.length === 3);
t("ordine doc", vars.join(",") === "articolo,lingua,CB_persona");
t("dedup", extractPromptVariables("{{x}} e {{  x }}").length === 1);
t("nessuna variabile", extractPromptVariables("testo semplice").length === 0);
t("stringa vuota", extractPromptVariables("").length === 0);
t("sintassi incompleta ignorata", extractPromptVariables("una { sola parentesi e {{sbagliata").length === 0);
t("variabile con underscore e spazi interni", vars[2] === "CB_persona");

// Sostituzione
let out = applyPromptVariables("Scrivi su {{tema}} per {{pubblico}}", { tema: "clima", pubblico: "genitori" });
t("sostituzione doppia", out === "Scrivi su clima per genitori");
t("variabile assente = stringa vuota", applyPromptVariables("Ciao {{x}}", {}) === "Ciao ");
t("valore null = vuoto", applyPromptVariables("A{{x}}B", { x: null }) === "AB");
t("valore con caratteri speciali", applyPromptVariables("{{x}}", { x: 'a "quote" <tag> & co' }) === 'a "quote" <tag> & co');
t("testo senza variabili invariato", applyPromptVariables("nessuna qui", {}) === "nessuna qui");
t("variabile con spazi nomi", applyPromptVariables("{{ lingua }}", { lingua: "IT" }) === "IT");
t(" corpo variabile con spazio interno", applyPromptVariables("{{nome utente}}", { "nome utente": "Ada" }) === "Ada");

// Round-trip
const text = "Funzione per {{modulo}} con input {{params}}";
const round = applyPromptVariables(text, { modulo: "auth", params: "{ id: 1 }" });
t("round-trip due variabili", round === "Funzione per auth con input { id: 1 }");

console.log(pass + " passed, " + fail + " failed");
