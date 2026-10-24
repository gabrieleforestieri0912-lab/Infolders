# Istruzioni di progetto — InFolders

## GitHub: salvare sempre

- Alla fine di OGNI task che modifica file (codice, docs, config, estensione),
  salva tutto su GitHub: `git add` dei file intenzionali, `git commit` e `git push`
  su `origin main` (repo https://github.com/gabrieleforestieri0912-lab/InFolders.git).
- Non lasciare mai modifiche non committate a fine task: se il push fallisce
  per mancanza di autenticazione, fermati e chiedi all'utente come autenticarti.
- Se il push viene rifiutato perché la remota è avanti, integra con
  `git pull --rebase origin main` e risolvi i conflitti prima di riprovare.
- Messaggi di commit in italiano, stile imperativo e conciso
  (es. "Aggiunge pagina login", "Corregge font sidebar estensione").
- Prima di committare: `git status` + `git diff --stat` per includere solo
  i file intenzionali. Mai committare segreti (`.env`, `.env.local`, token, chiavi). 
- L'identità git è già configurata nel repo: non modificarla.

## Estensione

- L'estensione vive in `extension/`: i bundle (`content.js`, `background.js`, ...)
  sono l'unico sorgente disponibile, si modificano direttamente.
- Dopo ogni modifica a JS eseguire `node --check` sul file toccato.
