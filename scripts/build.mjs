import fs from "node:fs/promises";
await fs.mkdir("dist", { recursive: true });
for (const name of [
  "index.html",
  "src",
  "vendor",
  "news.json",
  "apresentacao.html",
  ".nojekyll",
])
  await fs.cp(name, `dist/${name}`, { recursive: true });
console.log("Static build ready in dist/. No deployment performed.");
