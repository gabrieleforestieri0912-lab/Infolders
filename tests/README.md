# Test unit di InFolders

Le funzioni testabili (pure) di `extension/static/content.js` sono replicate qui
in file autonomi, perché il bundle è l'unico sorgente disponibile (esbuild) e non
si possono importare i moduli direttamente.

**Regola di manutenzione**: quando si cambia una funzione pura del bundle
(merge LWW, bucket recenti, D&D, full-text, transfer, prompt, guard tastiera,
anchor Claude, routing openChat, adapter piattaforme) va aggiornata anche la
replica corrispondente in `tests/unit/`, altrimenti i test non coprono più il
comportamento reale.

## Esecuzione

```
node tests/run-unit.mjs
```

Esegue ogni file di `tests/unit/*.mjs` in un processo node separato, parsa
l'ultima riga `N passed, N failed` e aggrega; esce con codice 1 se qualcosa
fallisce, così è agganciabile a CI.

## Test e2e (Puppeteer)

Gli script e2e vivono in `tools/e2e/` (gitignored: non sono parte del repo,
richiedono Chrome locale e opzionalmente rete). Il punto d'ingresso è
`tools/e2e/run-e2e.js` — vedere il README locale.
