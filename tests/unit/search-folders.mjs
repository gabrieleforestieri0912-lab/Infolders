function filterFolderTreeByQuery(nodes, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return nodes || [];
  function walk(folders2) {
    const out = [];
    for (const f of folders2 || []) {
      const nameMatch = (f.name || "").toLowerCase().includes(q);
      const sub = walk(f.subfolders || []);
      const anyChatMatch = (f.chats || []).some((c) => (c.name || "").toLowerCase().includes(q));
      if (nameMatch || anyChatMatch || sub.length) {
        let chatsOut = f.chats || [];
        if (anyChatMatch && !nameMatch) {
          chatsOut = chatsOut.filter((c) => (c.name || "").toLowerCase().includes(q));
        }
        out.push({ ...f, chats: chatsOut, subfolders: sub });
      }
    }
    return out;
  }
  return walk(nodes || []);
}
const folders = [
  { id: 1, name: "Lavoro", subfolders: [], chats: [{ name: "Email cliente Acme Corp", url: "u1" }, { name: "Report vendite", url: "u2" }] },
  { id: 2, name: "Studio", subfolders: [{ id: 3, name: "Clienti", subfolders: [], chats: [{ name: "Email cliente Acme Corp", url: "u3" }] }], chats: [] },
];
let tcPass = 0, tcFail = 0;
const tc = (l, c) => (c ? tcPass++ : (tcFail++, console.log("FAIL:", l, "->", c)));
tc("match chat titolo completo", filterFolderTreeByQuery(folders, "acme corp").length === 2);
tc("match chat subfolder", filterFolderTreeByQuery(folders, "acme").length === 2);
tc("match folder", filterFolderTreeByQuery(folders, "lavoro").length === 1);
tc("apostrofo", filterFolderTreeByQuery([{ name: "a", subfolders: [], chats: [{ name: "l'idea del blog" }] }], "l'idea").length === 1);
tc("nessun match", filterFolderTreeByQuery(folders, "zzz").length === 0);
console.log(tcPass + " passed, " + tcFail + " failed");
