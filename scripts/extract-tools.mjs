/** One-time migration. The application does not run this at startup. */
import fs from "node:fs/promises";
import path from "node:path";
import { parse, serializeOuter } from "parse5";

const source = await fs.readFile(
  process.argv[2] || "../hub-v1-source.html",
  "utf8",
);
const doc = parse(source, { sourceCodeLocationInfo: true });
const scripts = [],
  styles = [],
  panels = [];
function visit(node) {
  const attrs = Object.fromEntries(
    (node.attrs || []).map((a) => [a.name, a.value]),
  );
  if (node.tagName === "script")
    scripts.push({
      node,
      attrs,
      code: node.childNodes.map((c) => c.value || "").join(""),
    });
  if (node.tagName === "style")
    styles.push({
      node,
      attrs,
      code: node.childNodes.map((c) => c.value || "").join(""),
    });
  if (attrs.id?.startsWith("p-") && attrs.class?.includes("g-panel"))
    panels.push({ node, id: attrs.id.slice(2) });
  for (const c of node.childNodes || []) visit(c);
}
visit(doc);
const write = async (name, data) => {
  await fs.mkdir(path.dirname(name), { recursive: true });
  await fs.writeFile(name, data);
};
const strip = (node) => {
  node.childNodes = (node.childNodes || []).filter(
    (c) => !["script", "style"].includes(c.tagName),
  );
  for (const c of node.childNodes) strip(c);
};
for (const { node, id } of panels) {
  if (id === "home") continue;
  strip(node);
  await write(`src/features/${id}/view.html`, serializeOuter(node));
}
function find(node, id) {
  if (node.attrs?.some((a) => a.name === "id" && a.value === id)) return node;
  for (const c of node.childNodes || []) {
    const n = find(c, id);
    if (n) return n;
  }
}
const proposal = find(doc, "proporModal");
strip(proposal);
await write("src/features/construtor/proposal.html", serializeOuter(proposal));

const groups = {
  construtor: {
    "profile-import": 16,
    "asset-library": 17,
    drawer: 18,
    structures: 19,
    mode: 20,
    "drawer-preference": 21,
    engine: 31,
    proposal: 26,
  },
  comparador: {
    engine: 32,
    "quick-comparison": 22,
    "tax-equivalence": 23,
    tabs: 24,
  },
  simulador: { engine: 33, "card-order": 36 },
  irpf: { engine: 25 },
  holding: { engine: 28 },
  holdingcalc: { engine: 29 },
  aderencia: { engine: 35 },
  rv: { engine: 34 },
  ajustes: { engine: 38 },
  apresentacao: { engine: 13 },
};
for (const [feature, files] of Object.entries(groups)) {
  for (const [name, index] of Object.entries(files)) {
    let code = scripts[index].code.replace(
      /\blocalStorage\b/g,
      "window.hubStorage",
    );
    // Legacy scripts were parsed before DOMContentLoaded. Modules load after it.
    code = code.replace(
      /document\.addEventListener\(['"]DOMContentLoaded['"],\s*([\w$.]+)\s*\)/g,
      "queueMicrotask($1)",
    );
    code = code.replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/html2canvas@1\.4\.1\/dist\/html2canvas\.min\.js/g,
      "./vendor/html2canvas-1.4.1.min.js",
    );
    code = code.replace(
      /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js/g,
      "./vendor/html2canvas-1.4.1.min.js",
    );
    if (feature === "irpf")
      code = code.replace("new Date(y, m, 0)", "new Date(y, m + 1, 0)");
    await write(
      `src/features/${feature}/${name}.js`,
      `// Migrated from Hub v1. Review domain assumptions separately from interface changes.\n${code}\n`,
    );
  }
}
await write("vendor/xlsx-0.18.5.min.js", scripts[4].code);
for (const [name, i] of Object.entries({
  brand: 10,
  "png-theme": 9,
  projection: 41,
})) {
  let code = scripts[i].code.replace(/\blocalStorage\b/g, "window.hubStorage");
  code = code.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/html2canvas@1\.4\.1\/dist\/html2canvas\.min\.js/g,
    "./vendor/html2canvas-1.4.1.min.js",
  );
  await write(`src/compat/${name}.js`, code);
}
const excluded = new Set([
  "vidro-theme",
  "viva-theme",
  "viva-legibilidade",
  "mm-css",
  "g-ticker-css",
  "pwa-ipad",
  "apres-fullscreen-css",
]);
let css = styles
  .filter((s) => !excluded.has(s.attrs.id))
  .map((s) => s.code)
  .join("\n");
// Token definitions are centralized in the v2 theme, never overridden by migrated tools.
css = css
  .replace(/:root\s*\{[^}]*\}/g, "")
  .replace(/html\.theme-light[^{}]*\{[^}]*\}/g, "");
await write("src/compat/tools.css", "@layer legacy {\n" + css + "\n}\n");
await write(
  "docs/migration-source.json",
  JSON.stringify(
    {
      commit: "deadcb436293883ffa0f5324ca33d5b88d4ec927",
      sourceBytes: Buffer.byteLength(source),
      panels: panels.map((p) => p.id).filter((id) => id !== "home"),
      originalScriptBlocks: scripts.length,
      originalStyleBlocks: styles.length,
      extraction: groups,
    },
    null,
    2,
  ),
);
console.log(
  `Extracted ${panels.length - 1} tool views and ${Object.keys(groups).length} feature groups.`,
);
