// Golden Wok — Dapur Kilat. The hand-in program (Node 22, standard library
// only): it copies this repository's game/ and screenshots/ into /output and
// writes /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. It writes the same bytes on every run: the copied files
// are the repository's files, and the dossier is a deterministic function of
// them, so running it twice gives an identical /output.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes.
// The rest refuse an entry the scorer would refuse, so this program fails
// in the same places instead of handing in something invalid.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(out, { recursive: true });
for (const name of ['game', 'screenshots']) {
  const dest = join(out, name);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
}
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(join(out, 'dossier.json'), buildDossier(out, CAPS));
console.log(`Golden Wok handed in to ${out}`);
