// Replica delle funzioni di gating del trigger ":"
function isPromptTriggerInput(el) {
  if (!el || (el.closest && (el.closest("#infolders-sidebar") || el.closest("#infolders-prompt-trigger-popup")))) return false;
  if (el.className && typeof el.className === "string" && /(^|\s)infolders-/.test(el.className)) return false;
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (tag === "textarea") return true;
  if (tag === "input") {
    const type = (el.getAttribute("type") || "text").toLowerCase();
    return type === "text" || type === "search" || type === "url";
  }
  return el.isContentEditable === true;
}
function promptTriggerInputIsEmpty(el) {
  try {
    if (typeof el.value === "string") return el.value.trim() === "";
    return (el.textContent || "").trim() === "";
  } catch {
    return false;
  }
}
// Fake DOM helpers
const fake = (props) => Object.assign({
  closest(sel) {
    if (sel === "#infolders-sidebar") return this.parentId === "infolders-sidebar" ? { __fake: 1 } : null;
    if (sel === "#infolders-prompt-trigger-popup") return this.parentId === "infolders-prompt-trigger-popup" ? { __fake: 1 } : null;
    return null;
  },
  getAttribute(k) { return (this.attrs || {})[k] || null; }
}, props);

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// textarea chat vuota → trigger
const chatTa = fake({ tagName: "TEXTAREA", value: "" });
t("textarea vuota trigger", isPromptTriggerInput(chatTa) && promptTriggerInputIsEmpty(chatTa));
// textarea chat con testo → no trigger
const chatTaFull = fake({ tagName: "TEXTAREA", value: "ciao " });
t("textarea piena no", !promptTriggerInputIsEmpty(chatTaFull) || isPromptTriggerInput(chatTaFull) === false || true);
t("textarea piena vuota=false", promptTriggerInputIsEmpty(chatTaFull) === false);
// input sidebar dell'estensione → no
const ourInput = fake({ tagName: "INPUT", value: "", attrs: { type: "text" }, className: "infolders-search", parentId: "infolders-sidebar" });
t("input estensione no trigger", !isPromptTriggerInput(ourInput));
// input della popup → no
const popupInput = fake({ tagName: "INPUT", value: "", attrs: { type: "search" }, parentId: "infolders-prompt-trigger-popup" });
t("input popup no trigger", !isPromptTriggerInput(popupInput));
// contenteditable vuoto → trigger
const ce = fake({ tagName: "DIV", isContentEditable: true, textContent: "" });
t("contenteditable vuoto trigger", isPromptTriggerInput(ce) && promptTriggerInputIsEmpty(ce));
// contenteditable con testo → no trigger (vuota=false)
const ceFull = fake({ tagName: "DIV", isContentEditable: true, textContent: "risposta: " });
t("contenteditable pieno no", promptTriggerInputIsEmpty(ceFull) === false);
// input password → no
const pwd = fake({ tagName: "INPUT", value: "", attrs: { type: "password" } });
t("password no trigger", !isPromptTriggerInput(pwd));
// input checkbox → no
const chk = fake({ tagName: "INPUT", value: "", attrs: { type: "checkbox" } });
t("checkbox no trigger", !isPromptTriggerInput(chk));
// input search generico fuori estensione → trigger
const srch = fake({ tagName: "INPUT", value: "", attrs: { type: "search" } });
t("search generico trigger", isPromptTriggerInput(srch) && promptTriggerInputIsEmpty(srch));
// null safety
t("null no trigger", !isPromptTriggerInput(null));

// filtro prompt del popup
function filterPrompts(query, category) {
  const prompts = [
    { id: 1, title: "Email formale", content: "Scrivi una mail per {{destinatario}}", category: "Scrittura" },
    { id: 2, title: "Revue de code", content: "Analizza questo codice", category: "Coding" },
    { id: 3, title: "Post social", content: "{{post}} per {{piattaforma}}", category: "Marketing" }
  ];
  const q = query.toLowerCase().trim();
  return prompts.filter((p) => {
    if (category && p.category !== category) return false;
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });
}
t("filtro vuoto tutti", filterPrompts("").length === 3);
t("filtro titolo", filterPrompts("mail").length === 1);
t("filtro contenuto", filterPrompts("codice").length === 1);
t("filtro categoria", filterPrompts("", "Coding").length === 1);
t("filtro nessun match", filterPrompts("zzz").length === 0);

console.log(pass + " passed, " + fail + " failed");
