function normalizeSearchText(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}
function collapseText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}
function filterFolderTreeByQuery(nodes, query) {
  const q = normalizeSearchText(query);
  if (!q) return nodes || [];
  function walk(folders2) {
    const out = [];
    for (const f of folders2 || []) {
      const nameMatch = normalizeSearchText(f.name).includes(q);
      const sub = walk(f.subfolders || []);
      const anyChatMatch = (f.chats || []).some((c) => normalizeSearchText(c.name).includes(q));
      if (nameMatch || anyChatMatch || sub.length) {
        let chatsOut = f.chats || [];
        if (anyChatMatch && !nameMatch) {
          chatsOut = chatsOut.filter((c) => normalizeSearchText(c.name).includes(q));
        }
        out.push({ ...f, chats: chatsOut, subfolders: sub });
      }
    }
    return out;
  }
  return walk(nodes || []);
}

// Titolo salvato con innerText: a capo interno + spazio unificatore
const folders = [
  { id: 1, name: "Lavoro", subfolders: [], chats: [{ name: "Le riunioni\ndi luned\u00EC\u00A0con il team", url: "u1" }] },
  { id: 2, name: "Studio", subfolders: [], chats: [{ name: "Riassunto capitolo 5", url: "u2" }] },
];
// Titolo salvato con innerText: a capo interno + spazio unificatore
let tcPass = 0, tcFail = 0;
const tc = (l, c) => (c ? tcPass++ : (tcFail++, console.log("FAIL:", l, "->", c)));
tc("query normale su titolo con \\n e NBSP", filterFolderTreeByQuery(folders, "le riunioni di lunedì con il team").map((f) => f.name).join() === "Lavoro");
tc("query con NBSP", filterFolderTreeByQuery(folders, "le riunioni di lunedì\u00A0con il team").map((f) => f.name).join() === "Lavoro");
tc("nessun match", filterFolderTreeByQuery(folders, "blockchain").length === 0);
// collapseText (salvataggio futuro)
tc("collapseText normalizza \\n e NBSP", collapseText("Le riunioni\ndi luned\u00EC\u00A0con il team") === "Le riunioni di lunedì con il team");
console.log(tcPass + " passed, " + tcFail + " failed");
