// Build index.json from every widgets/<slug>/manifest.json.
// Validates each widget (well-formed manifest + a real <b:widget> blueprint) and
// resolves the jsDelivr CDN paths for xml/screenshot. Exits non-zero on any error
// so CI fails the PR. Zero dependencies — Node built-ins only.

import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CDN =
  "https://cdn.jsdelivr.net/gh/MoribundInstitute/mor-blogger-widget-compendium@main";
const REQUIRED = ["name", "type", "description"];
const SHOT_EXTS = ["png", "jpg", "jpeg", "webp", "svg"];

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDGETS = join(ROOT, "widgets");
const exists = async (p) => access(p).then(() => true).catch(() => false);

const entries = [];
let errors = 0;
const fail = (slug, msg) => {
  console.error(`  ✗ ${slug}: ${msg}`);
  errors++;
};

for (const d of await readdir(WIDGETS, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const slug = d.name;
  const dir = join(WIDGETS, slug);

  const manifestPath = join(dir, "manifest.json");
  const xmlPath = join(dir, "widget.xml");
  if (!(await exists(manifestPath))) { fail(slug, "missing manifest.json"); continue; }
  if (!(await exists(xmlPath))) { fail(slug, "missing widget.xml"); continue; }

  let m;
  try {
    m = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (e) {
    fail(slug, `manifest.json is not valid JSON (${e.message})`);
    continue;
  }
  for (const k of REQUIRED) if (!m[k]) fail(slug, `manifest missing "${k}"`);

  const xml = (await readFile(xmlPath, "utf8")).trimStart();
  if (!xml.startsWith("<b:widget")) fail(slug, "widget.xml must start with <b:widget");

  m.slug = slug;
  m.xml = `${CDN}/widgets/${slug}/widget.xml`;
  for (const ext of SHOT_EXTS) {
    if (await exists(join(dir, `screenshot.${ext}`))) {
      m.screenshot = `${CDN}/widgets/${slug}/screenshot.${ext}`;
      break;
    }
  }
  entries.push(m);
}

if (errors) {
  console.error(`\n${errors} error(s) — index.json not written.`);
  process.exit(1);
}

entries.sort((a, b) => a.name.localeCompare(b.name));
await writeFile(join(ROOT, "index.json"), JSON.stringify(entries, null, 2) + "\n");
console.log(`✓ Wrote index.json (${entries.length} widget(s))`);
