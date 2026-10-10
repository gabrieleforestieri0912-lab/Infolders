# Istruzioni di progetto — InFolders

## GitHub: salvare sempre

- Alla fine di OGNI task che modifica file (codice, docs, config, estensione),
  salva tutto su GitHub: `git add` dei file intenzionali, `git commit` e `git push`
  su `origin main` (repo `gabrieleforestieri0912-lab/Infolders`).
- Non lasciare mai modifiche non committate a fine task: se il push fallisce
  per mancanza di autenticazione, fermati e chiedi all'utente come autenticarti.
- Messaggi di commit in italiano, stile imperativo e conciso
  (es. "Aggiunge pagina login", "Corregge font sidebar estensione").
- Prima di committare: `git status` + `git diff --stat` per includere solo
  i file intenzionali. Mai committare segreti (`.env`, `.env.local`, token, chiavi).
- L'identità git è già configurata nel repo: non modificarla.
