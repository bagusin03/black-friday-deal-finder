// Deal Beacon — a Black Friday deal finder entry (Node 22, standard library
// only). The site itself is the app/ folder next to this file: plain static
// files a browser opens at app/index.html (ES modules, CSS, no build step),
// its 50 deals held in app/data.js. Nothing the site runs, styles or shows
// loads over the network; each deal only links out to its store.
//
// This program hands the site in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json with
// buildDossier from the vendored make.fun library. Leave
// vendor/makefun-frontend.ts exactly as it came in the kit: the scorer
// requires dossier.json to be byte for byte what its own copy writes.
//
// Serve the site locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 16 MiB of
// app files: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

// A run that wrote nothing usable must fail loudly instead of handing in
// an empty dossier: the file has to exist and hold the Load block.
const dossier = readFileSync(join(out, "dossier.json"), "utf8");
if (!dossier.includes("Totals")) throw new Error("dossier.json is missing its Load block");
