// Repliche minime delle funzioni di content.js per test isolato
var PLATFORM_CONFIGS = {
  "chatgpt.com": { name: "ChatGPT" },
  "gemini.google.com": { name: "Gemini" },
  "claude.ai": { name: "Claude" },
  "perplexity.ai": { name: "Perplexity" },
  "grok.com": { name: "Grok" }
};
function getPlatformConfigFor(host) {
  if (PLATFORM_CONFIGS[host]) return PLATFORM_CONFIGS[host];
  if (host.startsWith("www.")) return PLATFORM_CONFIGS[host.slice(4)];
  return void 0;
}
var SPECS = { chatgpt: {}, gemini: {}, claude: {}, perplexity: {}, grok: true ? { hrefTest: (href) => {
  try {
    const u = new URL(href, "https://grok.com/x");
    const host = u.hostname || "";
    return (host === "grok.com" || host.endsWith(".grok.com")) && /^\/(chat|c)\/[^/?#]+/.test(u.pathname);
  } catch {
    return false;
  }
} } : null };
function specFor(host) {
  if (SPECS[host]) return SPECS[host];
  if (host.startsWith("www.")) return SPECS[host.slice(4)];
  return void 0;
}

const cases = [
  ["chatgpt.com", "ChatGPT"], ["www.chatgpt.com", "ChatGPT"], ["claude.ai", "Claude"],
  ["www.claude.ai", "Claude"], ["gemini.google.com", "Gemini"], ["perplexity.ai", "Perplexity"],
  ["www.perplexity.ai", "Perplexity"], ["grok.com", "Grok"], ["www.grok.com", "Grok"],
  ["google.com", null], ["mail.google.com", null]
];
let tcPass = 0, fail = 0;
for (const [host, expected] of cases) {
  const got = (getPlatformConfigFor(host) || {}).name || null;
  if (got === expected) tcPass++;
  else { fail++; console.log("FAIL config:", host, "got", got); }
}
const hrefCases = [
  ["https://grok.com/chat/abc-123", true],
  ["https://grok.com/c/abc-123", true],
  ["https://www.grok.com/chat/abc", true],
  ["https://evil.com/chat/abc", false],
  ["https://grok.com/", false],
  ["https://grok.com/chat/", false],
  ["not-a-url", false]
];
for (const [href, expected] of hrefCases) {
  const got = SPECS.grok.hrefTest(href);
  if (got === expected) tcPass++;
  else { fail++; console.log("FAIL hrefTest:", href, "got", got); }
}
console.log(tcPass + " passed, " + fail + " failed");
