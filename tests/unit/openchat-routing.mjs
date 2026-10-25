// Replica della openChat di content.js con chrome finto
function makeOpenChat(chrome, win) {
  function requireExtensionContext() { return !!(chrome.runtime && chrome.runtime.id); }
  function openChat(url) {
    if (!requireExtensionContext()) return;
    let settled = false;
    try {
      chrome.runtime.sendMessage({ action: "openTab", url }, (response) => {
        settled = true;
        if (!response || !response.success) {
          try { win.open(url, "_blank"); } catch { }
        }
      });
    } catch {
      try { win.open(url, "_blank"); } catch { }
      return;
    }
    setTimeout(() => {
      if (!settled) {
        try { win.open(url, "_blank"); } catch { }
      }
    }, 1500);
  }
  return openChat;
}

function fakeRuntime({ respondWith, hasTabs }) {
  const calls = [];
  const chromeLike = {
    runtime: {
      id: "ext-id",
      sendMessage: (msg, cb) => {
        calls.push(msg);
        if (respondWith === "throw") throw new Error("context invalidated");
        if (typeof respondWith !== "undefined") cb(respondWith);
        // se respondWith === undefined niente callback (worker morto)
      }
    }
  };
  return { chromeLike, calls };
}

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));

// 1) handler risponde success → service worker apre, nessun window.open
const w1 = { opened: [] };
w1.open = (u) => { w1.opened.push(u); return {}; };
const f1 = fakeRuntime({ respondWith: { success: true } });
let o1 = makeOpenChat(f1.chromeLike, w1);
o1("https://chatgpt.com/c/1");
t("success: sendMessage inviato", f1.calls.length === 1 && f1.calls[0].action === "openTab");
t("success: nessun fallback", w1.opened.length === 0);

// 2) handler risponde success:false → fallback window.open
const w2 = { opened: [] };
w2.open = (u) => { w2.opened.push(u); return {}; };
const f2 = fakeRuntime({ respondWith: { success: false } });
let o2 = makeOpenChat(f2.chromeLike, w2);
o2("https://claude.ai/chat/2");
t("failure: callback richiesta", f2.calls.length === 1);
t("failure: fallback window.open", w2.opened.length === 1 && w2.opened[0] === "https://claude.ai/chat/2");

// 3) sendMessage throw (estensione ricaricata) → fallback sincrono
const w3 = { opened: [] };
w3.open = (u) => { w3.opened.push(u); return {}; };
const f3 = fakeRuntime({ respondWith: "throw" });
let o3 = makeOpenChat(f3.chromeLike, w3);
o3("https://grok.com/c/3");
t("throw: fallback window.open", w3.opened.length === 1 && w3.opened[0] === "https://grok.com/c/3");

// 4) contesto persa → nessuna azione
const w4 = { opened: [] };
w4.open = (u) => { w4.opened.push(u); return {}; };
const dead = { runtime: null };
let o4 = makeOpenChat(dead, w4);
o4("https://gemini.google.com/4");
t("no runtime: nessuna azione", w4.opened.length === 0);

console.log(pass + " passed, " + fail + " failed");
