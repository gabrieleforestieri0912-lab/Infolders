// Repliche pure del codice D&D in content.js (moveFolderToTarget / isFolderDescendant / addChatToFolder)
let nowIso = () => "2026-10-25T10:00:00.000Z";
let cloudQueue = 0;
let folders = [];
function normalizeUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}
function collapseText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}
function findFolderById(arr, id) {
  for (const f of arr) {
    if (f.id === id) return f;
    if (f.subfolders) {
      const found = findFolderById(f.subfolders, id);
      if (found) return found;
    }
  }
  return null;
}
function findAndRemoveFolder(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return nodes.splice(i, 1)[0];
    if (nodes[i].subfolders) {
      const found = findAndRemoveFolder(nodes[i].subfolders, id);
      if (found) return found;
    }
  }
  return null;
}
let lastToast = null;
const showToast = (msg, type) => { lastToast = { msg, type }; };
const saveFolders = () => {};
const queueCloudSync = () => { cloudQueue++; };
function isFolderDescendant(sourceId, targetId) {
  const source = findFolderById(folders, sourceId);
  if (!source) return false;
  return !!findFolderById(source.subfolders || [], targetId);
}
function moveFolderToTarget(folderId, targetId) {
  if (folderId === targetId) return false;
  if (targetId != null && isFolderDescendant(folderId, targetId)) {
    showToast("Non puoi spostare una cartella dentro sé stessa o una sua sottocartella", "error");
    return false;
  }
  const nodeToMove = findAndRemoveFolder(folders, folderId);
  if (!nodeToMove) {
    showToast("Errore nello spostamento della cartella", "error");
    return false;
  }
  nodeToMove.updatedAt = nowIso();
  const destParent = targetId != null ? findFolderById(folders, targetId) : null;
  if (destParent) {
    destParent.subfolders = destParent.subfolders || [];
    destParent.subfolders.push(nodeToMove);
  } else {
    folders.push(nodeToMove);
  }
  saveFolders();
  queueCloudSync();
  return true;
}
function addChatToFolder(folder, chat) {
  if (!folder || !chat || !chat.url) return false;
  if ((folder.chats || []).some((c) => normalizeUrl(c.url || "") === normalizeUrl(chat.url))) {
    showToast(`"${collapseText(chat.name || "Chat")}" è già in ${folder.name}`, "info");
    return false;
  }
  folder.chats = folder.chats || [];
  folder.chats.push({ name: chat.name || "Chat", url: chat.url, platform: chat.platform || "Generico" });
  folder.updatedAt = nowIso();
  saveFolders();
  queueCloudSync();
  return true;
}

let pass = 0, fail = 0;
const t = (l, c) => (c ? pass++ : (fail++, console.log("FAIL:", l)));
const base = () => [
  { id: 1, name: "A", subfolders: [{ id: 2, name: "B", subfolders: [{ id: 3, name: "C", subfolders: [] }], chats: [] }], chats: [] },
  { id: 4, name: "D", subfolders: [], chats: [] }
];

// Descendenza
folders = base();
t("figlio è discendente", isFolderDescendant(1, 2));
t("nepote è discendente", isFolderDescendant(1, 3));
t("sorella NON discendente", !isFolderDescendant(1, 4));
t("inverso: 4 non ha discendenti", !isFolderDescendant(4, 1));
folders = [];
t("source inesistente safe", !isFolderDescendant(99, 1));

// Move in root
folders = base();
cloudQueue = 0;
t("move to root ok", moveFolderToTarget(2, null));
t("radice ora contiene A, D, B", folders.length === 3 && folders[2].name === "B");
t("sottocartelle preservate", folders[2].subfolders[0].name === "C");
t("updatedAt settato", !!folders[2].updatedAt && folders[2].updatedAt === "2026-10-25T10:00:00.000Z");
t("queueCloudSync eseguito", cloudQueue === 1);

// Move in un'altra cartella
folders = base();
t("move in D ok", moveFolderToTarget(2, 4));
const d = findFolderById(folders, 4);
t("B dentro D", d.subfolders.length === 1 && d.subfolders[0].id === 2);

// Move su se stessa / discendente
folders = base();
lastToast = null;
t("move su se stessa rifiutata", !moveFolderToTarget(1, 1));
t("niente toast di errore su self (silenzioso)", lastToast === null);
folders = base();
lastToast = null;
t("move dentro discendente rifiutata", !moveFolderToTarget(1, 3));
t("toast errore discendente", lastToast && lastToast.type === "error");
t("struttura invariata dopo rifiuto", folders.length === 2 && folders[0].name === "A");

// Move id inesistente
folders = base();
lastToast = null;
t("move id inesistente rifiutata", !moveFolderToTarget(99, 4));
t("toast errore id inesistente", lastToast && lastToast.type === "error");

// AddChatToFolder
folders = base();
const fa = findFolderById(folders, 1);
cloudQueue = 0;
t("add chat ok", addChatToFolder(fa, { name: "Chat X", url: "https://chatgpt.com/c/abc", platform: "ChatGPT" }));
t("chat aggiunta", fa.chats.length === 1 && fa.chats[0].name === "Chat X");
t("default platform", addChatToFolder(fa, { url: "https://x.com/y" }) && fa.chats[1].platform === "Generico");
lastToast = null;
t("duplicato url rifiutato", !addChatToFolder(fa, { name: "Chat X", url: "https://chatgpt.com/c/abc" }));
t("toast info duplicato", lastToast && lastToast.type === "info");
t("url normalizzati per dedup", !addChatToFolder(fa, { name: "Z", url: "https://chatgpt.com/c/abc/" }));
lastToast = null;
t("chat senza url rifiutata", !addChatToFolder(fa, {}));
t("folder null rifiutata", !addChatToFolder(null, { url: "x" }));
t("updatedAt su folder", fa.updatedAt === "2026-10-25T10:00:00.000Z");

// Payload parser (replica)
function parseInFoldersDragPayload(dragData, dataTransferLike) {
  if (dragData) return dragData;
  try {
    const raw = dataTransferLike.getData("application/x-infolders") || dataTransferLike.getData("text/plain");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || (data.type !== "folder" && data.type !== "bookmark")) return null;
    return data;
  } catch {
    return null;
  }
}
const dtEmpty = { getData: () => "" };
t("payload null senza dragdata", parseInFoldersDragPayload(null, dtEmpty) === null);
const dtBad = { getData: () => "not-json" };
t("json malformato safe", parseInFoldersDragPayload(null, dtBad) === null);
const dtWrong = { getData: () => JSON.stringify({ type: "evil" }) };
t("tipo sconosciuto scartato", parseInFoldersDragPayload(null, dtWrong) === null);
const dtBookmark = { getData: () => JSON.stringify({ type: "bookmark", id: 1, url: "u" }) };
t("bookmark fallback dataTransfer", parseInFoldersDragPayload(null, dtBookmark).type === "bookmark");
t("dragData ha priorità", parseInFoldersDragPayload({ type: "folder", id: 7 }, dtBookmark).type === "folder");

console.log(pass + " passed, " + fail + " failed");
