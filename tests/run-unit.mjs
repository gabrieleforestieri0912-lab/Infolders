// Runner della suite unit: esegue ogni test di tests/unit/ come processo node
// separato, parsa l'ultima riga "N passed, N failed" e aggrega i risultati.
// Esce con codice 1 se almeno un test fallisce o crasha.
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const unitDir = path.join(here, "unit");
const files = readdirSync(unitDir).filter((f) => f.endsWith(".mjs")).sort();

let totalPass = 0;
let totalFail = 0;
const failedFiles = [];

for (const file of files) {
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(unitDir, file)], { cwd: path.dirname(here) });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("close", (code) => resolve({ code, out, err }));
    child.on("error", (e) => resolve({ code: -1, out, err: String(e) }));
  });
  const m = result.out.match(/(\d+)\s+passed,\s+(\d+)\s+failed\s*$/);
  let pass = 0, fail = 0;
  if (m) [pass, fail] = [Number(m[1]), Number(m[2])];
  totalPass += pass;
  totalFail += fail;
  const crashed = result.code !== 0 || !m;
  if (fail > 0 || crashed) {
    failedFiles.push(file);
    console.log(`✗ ${file}: ${pass} passed, ${fail} failed${crashed ? ` (exit ${result.code})` : ""}`);
    if (result.err.trim()) console.log("  stderr:", result.err.trim().slice(0, 400));
  } else {
    console.log(`✓ ${file}: ${pass} passed`);
  }
}

console.log(`\nTOTALE: ${totalPass} passed, ${totalFail} failed su ${files.length} file`);
if (failedFiles.length) {
  console.log("FILE CON ERRORI:", failedFiles.join(", "));
  process.exitCode = 1;
}
