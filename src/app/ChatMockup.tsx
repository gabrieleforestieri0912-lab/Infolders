'use client';

import React from 'react';
import { PLATFORM_ICONS } from '@/app/PlatformIcons';

const ChatGPT_COLOR = '#a855f7';
const GEMINI_COLOR = '#60a5fa';
const CLAUDE_COLOR = '#fb923c';
const PERPLEXITY_COLOR = '#06b6d4';

type PlatformKey = 'ChatGPT' | 'Gemini' | 'Claude' | 'Perplexity';

interface DemoChat {
  title: string;
  starred?: boolean;
}

interface DemoFolder {
  id: string;
  name: string;
  color: string;
  chats: DemoChat[];
  sub?: DemoFolder[];
}

interface PlatformDemo {
  key: PlatformKey;
  color: string;
  folders: DemoFolder[];
  loose: DemoChat[];
}

const DEMO: PlatformDemo[] = [
  {
    key: 'ChatGPT',
    color: ChatGPT_COLOR,
    folders: [
      {
        id: 'gpt-lavoro',
        name: 'Lavoro',
        color: '#a855f7',
        chats: [
          { title: 'Strategia lancio Q3', starred: true },
          { title: 'Email cliente Acme Corp' },
          { title: 'Report vendite giugno' },
          { title: 'Brainstorming nomi prodotto' },
        ],
        sub: [
          {
            id: 'gpt-clienti',
            name: 'Clienti',
            color: '#c084fc',
            chats: [{ title: 'Contratto Rossi SRL' }, { title: 'Preventivo Bianchi' }],
          },
        ],
      },
      {
        id: 'gpt-studio',
        name: 'Studio',
        color: '#60a5fa',
        chats: [
          { title: 'Appunti esame di storia' },
          { title: 'Riassunto capitolo 5' },
          { title: 'Esercizi di statistica', starred: true },
        ],
      },
      {
        id: 'gpt-side',
        name: 'Side Project',
        color: '#22c55e',
        chats: [{ title: 'Idea app per ricette' }, { title: 'Domini per il blog' }],
      },
    ],
    loose: [{ title: 'Ricetta carbonara originale' }, { title: 'Traduzione email inglese' }],
  },
  {
    key: 'Gemini',
    color: GEMINI_COLOR,
    folders: [
      {
        id: 'gem-ricerche',
        name: 'Ricerche',
        color: '#60a5fa',
        chats: [
          { title: 'Confronto smartphone 2026', starred: true },
          { title: 'Migliori musei a Roma' },
          { title: 'Itinerario weekend Dolomiti' },
        ],
      },
      {
        id: 'gem-uni',
        name: 'Università',
        color: '#a855f7',
        chats: [{ title: 'Tesi — capitolo 2' }, { title: 'Bibliografia ragionata' }],
        sub: [
          {
            id: 'gem-esami',
            name: 'Esami',
            color: '#f472b6',
            chats: [{ title: 'Simulazione esame fisica' }],
          },
        ],
      },
    ],
    loose: [{ title: 'Allenamento mezza maratona' }, { title: 'Spiegazione buchi neri' }],
  },
  {
    key: 'Claude',
    color: CLAUDE_COLOR,
    folders: [
      {
        id: 'cla-scrittura',
        name: 'Scrittura',
        color: '#fb923c',
        chats: [
          { title: "Articolo blog sull'AI", starred: true },
          { title: 'Revisione racconto breve' },
          { title: 'Newsletter #12' },
        ],
      },
      {
        id: 'cla-codice',
        name: 'Codice',
        color: '#06b6d4',
        chats: [{ title: 'Refactor API autenticazione' }, { title: 'Debug query SQL lenta' }],
      },
    ],
    loose: [{ title: 'Regole gioco da tavolo' }, { title: 'Tone of voice brand', starred: true }],
  },
  {
    key: 'Perplexity',
    color: PERPLEXITY_COLOR,
    folders: [
      {
        id: 'per-news',
        name: 'News & Tech',
        color: '#06b6d4',
        chats: [{ title: 'Annunci Google I/O', starred: true }, { title: 'Andamento tassi BCE' }],
      },
      {
        id: 'per-viaggi',
        name: 'Viaggi',
        color: '#fb923c',
        chats: [{ title: 'Voli Milano–Tokyo agosto' }, { title: 'Assicurazione viaggio' }],
      },
    ],
    loose: [{ title: 'Sintomi carenza ferro' }, { title: "Storia dell'Inter" }],
  },
];

/* ─── Icone ─── */

const FolderIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color + '33'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ChatIcon = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

/* ─── Righe ─── */

function ChatRow({
  chat,
  accent,
  selected,
  onSelect,
}: {
  chat: DemoChat;
  accent: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors"
      style={{
        background: selected ? accent + '26' : 'transparent',
        color: selected ? '#fff' : '#d4d4d8',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <span className="shrink-0 text-zinc-500">
        <ChatIcon />
      </span>
      <span className="min-w-0 flex-1 truncate">{chat.title}</span>
      {chat.starred && (
        <span className="shrink-0">
          <StarIcon />
        </span>
      )}
    </button>
  );
}

function FolderRow({
  folder,
  accent,
  depth,
  openIds,
  selectedId,
  onToggle,
  onSelect,
}: {
  folder: DemoFolder;
  accent: string;
  depth: number;
  openIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const open = openIds.has(folder.id);
  const total = folder.chats.length + (folder.sub?.reduce((n, s) => n + s.chats.length, 0) ?? 0);

  return (
    <div>
      <button
        onClick={() => onToggle(folder.id)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-zinc-200 transition-colors hover:bg-white/5"
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <span className="shrink-0 text-zinc-500">
          <ChevronIcon open={open} />
        </span>
        <FolderIcon color={folder.color} />
        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ background: folder.color + '26', color: folder.color }}
        >
          {total}
        </span>
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5" style={{ paddingLeft: 8 + depth * 14 }}>
          {folder.chats.map((chat) => {
            const id = `${folder.id}/${chat.title}`;
            return (
              <div key={id} className="pl-5">
                <ChatRow chat={chat} accent={accent} selected={selectedId === id} onSelect={() => onSelect(id)} />
              </div>
            );
          })}
          {folder.sub?.map((s) => (
            <FolderRow
              key={s.id}
              folder={s}
              accent={accent}
              depth={depth + 1}
              openIds={openIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Demo ─── */

function countChats(demo: PlatformDemo) {
  const inFolders = (folders: DemoFolder[]): number =>
    folders.reduce((n, f) => n + f.chats.length + (f.sub ? inFolders(f.sub) : 0), 0);
  return inFolders(demo.folders) + demo.loose.length;
}

function countFolders(demo: PlatformDemo) {
  const count = (folders: DemoFolder[]): number =>
    folders.reduce((n, f) => n + 1 + (f.sub ? count(f.sub) : 0), 0);
  return count(demo.folders);
}

function searchAll(demo: PlatformDemo, q: string): { chat: DemoChat; path: string }[] {
  const out: { chat: DemoChat; path: string }[] = [];
  const walk = (folders: DemoFolder[], trail: string) => {
    for (const f of folders) {
      const path = trail ? `${trail} / ${f.name}` : f.name;
      for (const c of f.chats) {
        if (c.title.toLowerCase().includes(q)) out.push({ chat: c, path });
      }
      if (f.sub) walk(f.sub, path);
    }
  };
  walk(demo.folders, '');
  for (const c of demo.loose) {
    if (c.title.toLowerCase().includes(q)) out.push({ chat: c, path: 'Senza cartella' });
  }
  return out;
}

export default function ChatMockup() {
  const [activeKey, setActiveKey] = React.useState<PlatformKey>('ChatGPT');
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set(['gpt-lavoro']));
  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>('gpt-lavoro/Strategia lancio Q3');

  const demo = DEMO.find((d) => d.key === activeKey)!;
  const accent = demo.color;
  const Icon = PLATFORM_ICONS[activeKey];
  const totalChats = countChats(demo);
  const totalFolders = countFolders(demo);
  const q = query.trim().toLowerCase();
  const results = q ? searchAll(demo, q) : [];

  const switchPlatform = (key: PlatformKey) => {
    setActiveKey(key);
    setQuery('');
    setSelectedId(null);
    const next = DEMO.find((d) => d.key === key)!;
    setOpenIds(new Set(next.folders.length ? [next.folders[0].id] : []));
  };

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto mt-16 max-w-4xl">
      {/* Platform tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:justify-center">
        {DEMO.map((d) => {
          const TabIcon = PLATFORM_ICONS[d.key];
          const active = d.key === activeKey;
          return (
            <button
              key={d.key}
              onClick={() => switchPlatform(d.key)}
              className="flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all"
              style={{
                borderColor: active ? d.color + '66' : 'rgba(255,255,255,0.08)',
                background: active ? d.color + '1a' : 'rgba(255,255,255,0.03)',
                color: active ? '#fff' : '#a1a1aa',
                boxShadow: active ? `0 0 20px ${d.color}33` : 'none',
              }}
            >
              {TabIcon ? <TabIcon color={d.color} size={15} /> : <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />}
              {d.key}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: d.color + '26', color: d.color }}
              >
                {countChats(d)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sidebar mockup */}
      <div
        className="overflow-hidden rounded-2xl border bg-[#0d0015] shadow-2xl transition-shadow"
        style={{ borderColor: accent + '33', boxShadow: `0 0 60px ${accent}1a, 0 24px 60px rgba(0,0,0,0.5)` }}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3" style={{ background: accent + '0d' }}>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: accent + '26' }}>
            {Icon ? <Icon color={accent} size={15} /> : null}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-white">InFolders</p>
            <p className="text-[11px] leading-tight" style={{ color: accent }}>
              {activeKey} · sidebar
            </p>
          </div>
          <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Demo live
          </span>
        </div>

        {/* Search */}
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-zinc-400 focus-within:border-white/20">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cerca tra le ${totalChats} chat di ${activeKey}...`}
              className="w-full bg-transparent text-[13px] text-zinc-200 placeholder-zinc-600 outline-none"
              aria-label="Cerca nelle chat"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-xs text-zinc-500 hover:text-white" aria-label="Cancella ricerca">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[380px] min-h-[300px] overflow-y-auto px-3 py-3">
          {q ? (
            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {results.length} {results.length === 1 ? 'risultato' : 'risultati'} per “{query.trim()}”
              </p>
              {results.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-zinc-500">
                  Nessuna chat trovata. Prova con un altro termine.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {results.map((r) => {
                    const id = `${r.path}/${r.chat.title}`;
                    return (
                      <div key={id}>
                        <ChatRow chat={r.chat} accent={accent} selected={selectedId === id} onSelect={() => setSelectedId(id)} />
                        <p className="truncate pb-1 pl-9 text-[11px] text-zinc-600">{r.path}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Cartelle · {totalFolders}
              </p>
              {demo.folders.map((f) => (
                <FolderRow
                  key={f.id}
                  folder={f}
                  accent={accent}
                  depth={0}
                  openIds={openIds}
                  selectedId={selectedId}
                  onToggle={toggle}
                  onSelect={setSelectedId}
                />
              ))}
              {demo.loose.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                    Senza cartella
                  </p>
                  {demo.loose.map((chat) => {
                    const id = `loose/${chat.title}`;
                    return (
                      <ChatRow key={id} chat={chat} accent={accent} selected={selectedId === id} onSelect={() => setSelectedId(id)} />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2.5 text-[11px] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Sincronizzato · {totalChats} chat in {totalFolders} cartelle
          <span className="ml-auto hidden sm:inline">Trascina le chat per riordinarle</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-600">
        Demo interattiva — cambia piattaforma, apri le cartelle e prova la ricerca globale.
      </p>
    </div>
  );
}
