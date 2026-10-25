// Replica della logica di ancoraggio in injectInPageFoldersSection
function navRowText(el) {
  const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
  return txt && txt.length <= 60 ? txt : "";
}
function computeInsertion(targetContainer, referenceElement) {
  let insertBeforeNode = referenceElement || targetContainer.firstChild || null;
  let anchoredPlacement = false;
  let anchorRow = null;
  let anchorAfter = true;
  for (const child of targetContainer.children) {
    if (/^(personalizz|customi)/i.test(navRowText(child))) {
      anchorRow = child;
      break;
    }
  }
  if (!anchorRow) {
    for (const child of targetContainer.children) {
      if (/^(tutte le chat|tutti i progetti|progetti|all chats|projects)/i.test(navRowText(child))) {
        anchorRow = child;
        anchorAfter = false;
        break;
      }
    }
  }
  if (anchorRow && anchorRow.parentElement === targetContainer) {
    insertBeforeNode = anchorAfter ? anchorRow.nextSibling : anchorRow;
    anchoredPlacement = true;
  }
  if (!anchoredPlacement && referenceElement && referenceElement.parentElement) {
    // fallback esistente: header "recenti/chat"
    const siblings = Array.from(referenceElement.parentElement.children);
    const idx = siblings.indexOf(referenceElement);
    for (let i = 0; i < idx; i++) {
      const s = siblings[i];
      const txt = (s.textContent || "").trim();
      if (s.children.length <= 1 && /^(recenti|chat)$/i.test(txt)) {
        insertBeforeNode = s;
        break;
      }
    }
  }
  return insertBeforeNode;
}

// mock
const mk = (text, children = []) => ({ textContent: text, children, parentElement: null });
const wrapper = (items) => {
  const c = mk("", items);
  c.firstChild = items[0] || null;
  items.forEach((i) => { i.parentElement = c; });
  return c;
};

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// Claude: personalizzazione poi chat
const pers = mk("Personalizzazione");
const chatList = mk("Tutte le chat e progetti (100 voci ...)".padEnd(80, ".")); // lunga → excluded dai nav row
const chat1 = mk("Chat 1");
const chat2 = mk("Chat 2");
const container = wrapper([pers, chatList, chat1, chat2]);
const ins = computeInsertion(container, null);
// atteso: dopo "Personalizzazione" → prima riga = chatList
const idx = container.children.indexOf(ins);
t("dopo personalizzazione", ins === pers.nextSibling);

// Claude senza personalizzazione → prima di "Progetti" (voce breve)
const proj = mk("Progetti");
const r1 = mk("Chat A");
const container2 = wrapper([r1, proj, r1]);
const ins2 = computeInsertion(container2, null);
t("prima di progetti", ins2 === proj);

// ChatGPT: niente ancore → fallback behaviours
const chatRef = mk("Prima chat");
const chatInner = mk("header unserer liste");
const container3 = wrapper([chatRef]);
const ins3 = computeInsertion(container3, chatRef);
t("fallback reference", ins3 === chatRef || ins3 === container3.firstChild);

// Guard tastiera
const PROMPT_TRIGGER_POPUP_ID = "infolders-prompt-trigger-popup";
function isInfoldersFormTarget(el) {
  if (!el) return false;
  try {
    if (el.closest && (el.closest("#infolders-sidebar") || el.closest("#infolders-inpage-folders-section") || el.closest("#" + PROMPT_TRIGGER_POPUP_ID))) return true;
  } catch {
    return false;
  }
  const cls = typeof el.className === "string" ? el.className : "";
  if (cls && /(^|\s)infolders-/.test(cls)) return true;
  return false;
}
const closest = (id) => (id ? { $: id } : null);
const sidebarInput = { closest: (sel) => (sel === "#infolders-sidebar" ? {} : null) };
t("input sidebar protetto", isInfoldersFormTarget(sidebarInput));
const inpageInput = { closest: (sel) => (sel === "#infolders-inpage-folders-section" ? {} : null) };
t("input in-page protetto", isInfoldersFormTarget(inpageInput));
const popupInput = { closest: (sel) => (sel === "#infolders-prompt-trigger-popup" ? {} : null) };
t("input popup protetto", isInfoldersFormTarget(popupInput));
const nativeInput = { closest: () => null, className: "" };
t("input nativo NON protetto", !isInfoldersFormTarget(nativeInput));
const nativeClass = { closest: () => null, className: "infolders-transfer-move" };
t("input class che inizia con infolders- protetto", isInfoldersFormTarget(nativeClass));
const nativeClass2 = { closest: () => null, className: "app-search input" };
t("input senza il prefisso NON protetto", !isInfoldersFormTarget(nativeClass2));
const infoldersPartialClass = { closest: () => null, className: "xxx infolders-y z" };
t("class infolder mid protetto", isInfoldersFormTarget(infoldersPartialClass));
t("input malato non crashe", !isInfoldersFormTarget(null));

// Eventi che NEY guard lascia passare: Escape
const stopCalls = [];
function makeGuard() {
  const guard = (e) => {
    if (!isInfoldersFormTarget(e.target)) return;
    if (e.key === "Escape") return;
    e.stopPropagation();
  };
  return guard;
}
const guard = makeGuard();
const evSidebar = { target: sidebarInput, key: "a", stopPropagation: () => stopCalls.push("a") };
guard(evSidebar);
const evEscape = { target: sidebarInput, key: "Escape", stopPropagation: () => stopCalls.push("esc") };
guard(evEscape);
const evNative = { target: nativeInput, key: "a", stopPropagation: () => stopCalls.push("native") };
guard(evNative);
console.log("guard calls:", JSON.stringify(stopCalls));
t("guard ferma 'a'", stopCalls[0] === "a");
t("guard lascia passare Escape", !stopCalls.includes("esc"));
t("guard ignora eventi nativi", !stopCalls.includes("native"));

console.log(pass + " passed, " + fail + " failed");
