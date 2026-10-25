// Test per la classificazione errori di perdita contesto e per i guard storage
let tcPass = 0, tcFail = 0;
const tc = (l, c) => (c ? tcPass++ : (tcFail++, console.log("FAIL:", l)));

// Riplica di isContextLossMessage (content.js)
function isContextLossMessage(msg) {
  if (!msg) return false;
  return /Extension context invalid/i.test(msg) || /reading '(local|onChanged|runtime)'/.test(msg);
}

const yes = [
  "Uncaught Extension context invalidated.",
  "Extension context invalidated",
  "Error: Extension context invalidated. (laterale)",
  "Cannot read properties of undefined (reading 'local')",
  "TypeError: Cannot read properties of undefined (reading 'local')",
  "Cannot read property of undefined (reading 'onChanged')",
  "Cannot read properties of undefined (reading 'runtime')"
];
for (const m of yes) tc("classificato come context-loss: " + m, isContextLossMessage(m));

const no = [
  "Cannot read properties of undefined (reading 'split')",
  "Uncaught TypeError: cb is not a function",
  "sortBy is not a function",
  "Network error",
  "",
  null
];
for (const m of no) tc("NON context-loss: " + m, !isContextLossMessage(m));

// Casi limite
tc("msg vuoto", !isContextLossMessage(""));
tc("msg null", !isContextLossMessage(null));

// Guard: requireExtensionContext con chrome sotto tre condizioni (genitore IIFE del bundle)
{
  const chrome = { runtime: { id: "aid" } };
  function requireExtensionContext() { try { return !!(chrome.runtime && chrome.runtime.id); } catch { return false; } }
  tc("vivo → true", requireExtensionContext() === true);
}
{
  const chrome = {};
  function requireExtensionContext() { try { return !!(chrome.runtime && chrome.runtime.id); } catch { return false; } }
  tc("morto (chrome.runtime undefined) → false", requireExtensionContext() === false);
}
{
  const chrome = {};
  Object.defineProperty(chrome, "runtime", { get() { throw new TypeError("Extension context invalidated."); } });
  function requireExtensionContext() { try { return !!(chrome.runtime && chrome.runtime.id); } catch { return false; } }
  tc("getter che lancia → false", requireExtensionContext() === false);
}

console.log(tcPass + " passed, " + tcFail + " failed");
