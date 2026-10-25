// Test del merge prompt (replica le funzioni pure di content.js)
let tcPass = 0, tcFail = 0;
const tc = (l, c) => (c ? tcPass++ : (tcFail++, console.log("FAIL:", l)));
function nowIso() {
  return new Date("2026-10-25T10:00:00.000Z").toISOString();
}
function maxTs(a, b) {
  a = typeof a === "string" ? a : "";
  b = typeof b === "string" ? b : "";
  return a > b ? a : b;
}
function collectFolderIds(nodes, out) {
  out = out || [];
  (nodes || []).forEach((f) => {
    if (f && f.id != null) out.push(f.id);
    if (f && f.subfolders) collectFolderIds(f.subfolders, out);
  });
  return out;
}
function mergePromptLists(local, cloud, tombMap, now) {
  const localMap = new Map();
  const cloudMap = new Map();
  (local || []).forEach((p) => {
    if (p && p.id != null) localMap.set(p.id, p);
  });
  (cloud || []).forEach((p) => {
    if (p && p.id != null) cloudMap.set(p.id, p);
  });
  const ids = [];
  const seen = {};
  [...localMap.keys(), ...cloudMap.keys()].forEach((id) => {
    if (!seen[id]) { seen[id] = 1; ids.push(id); }
  });
  const out = [];
  const deleted = new Set();
  ids.forEach((id) => {
    const l = localMap.get(id);
    const c = cloudMap.get(id);
    const lts = l ? typeof l.updatedAt === "string" ? l.updatedAt : l.createdAt || "" : "";
    const cts = c ? typeof c.updatedAt === "string" ? c.updatedAt : c.createdAt || "" : "";
    const editedAt = maxTs(lts, cts);
    const tomb = tombMap.get("prompt__" + id);
    if (tomb) {
      const anyAfter = (lts && lts > tomb.deletedAt) || (cts && cts > tomb.deletedAt);
      if (!anyAfter) { deleted.add(id); return; }
    }
    const winner = !c ? l : !l ? c : cts > lts ? c : l;
    out.push(Object.assign({}, winner, { updatedAt: editedAt || now }));
  });
  return { prompts: out, deletedIds: deleted };
}

// 1. Both sides present, cloud more recent → wins, new fields merged
let r = mergePromptLists(
  [{ id: 1, title: "Vecchio", updatedAt: "2026-10-20T00:00:00Z" }],
  [{ id: 1, title: "Nuovo titolo", updatedAt: "2026-10-22T00:00:00Z" }],
  new Map(), nowIso());
tc("lww cloud", r.prompts.length === 1 && r.prompts[0].title === "Nuovo titolo");

// 2. Local more recent → wins
r = mergePromptLists(
  [{ id: 1, title: "Modificato locale", updatedAt: "2026-10-23T00:00:00Z" }],
  [{ id: 1, title: "Vecchio cloud", updatedAt: "2026-10-19T00:00:00Z" }],
  new Map(), nowIso());
tc("lww local", r.prompts[0].title === "Modificato locale");

// 3. Only local → preserved
r = mergePromptLists([{ id: 2, title: "Solo locale", updatedAt: "2026-10-21T00:00:00Z" }], [], new Map(), nowIso());
tc("local-only", r.prompts.length === 1);

// 4. Only cloud → added
r = mergePromptLists([], [{ id: 3, title: "Solo cloud" }], new Map(), nowIso());
tc("cloud-only ha updatedAt", r.prompts.length === 1 && r.prompts[0].updatedAt);

// 5. Tombstone without post-delete edits → deleted on both sides
r = mergePromptLists(
  [{ id: 4, title: "Eliminato", updatedAt: "2026-10-21T00:00:00Z" }],
  [{ id: 4, title: "Eliminato", updatedAt: "2026-10-21T00:00:00Z" }],
  new Map([["prompt__4", { kind: "prompt", id: 4, deletedAt: "2026-10-22T00:00:00Z" }]]), nowIso());
tc("tombstone delete", r.prompts.length === 0);

// 6. Tombstone but resurrection after delete → survives
r = mergePromptLists(
  [{ id: 5, title: "Risorto", updatedAt: "2026-10-23T00:00:00Z" }],
  [],
  new Map([["prompt__5", { kind: "prompt", id: 5, deletedAt: "2026-10-22T00:00:00Z" }]]), nowIso());
tc("tombstone decay", r.prompts.length === 1);

// 7. No updatedAt/createdAt fields (legacy data) → still merged, no crash
r = mergePromptLists([{ id: 6, title: "Legacy" }], [{ id: 6, title: "Cloud legacy" }], new Map(), nowIso());
tc("legacy senza timestamp", r.prompts.length === 1);

// 8. Non-merge of malformed entries
r = mergePromptLists([ null, { id: 7, title: "Buono" } ], [null], new Map(), nowIso());
tc("malformed non uniti", r.prompts.length === 1 && r.prompts[0].id === 7);

console.log(tcPass + " passed, " + tcFail + " failed");
