import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
const walk = async (dir) =>
  (
    await Promise.all(
      (await fs.readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
const files = [
  ...(await walk("src")),
  ...(await walk("scripts")),
  ...(await walk("tests")),
];
for (const file of files.filter((f) => /\.(m?js)$/.test(f))) {
  const source = await fs.readFile(file, "utf8");
  if (file.startsWith("src/features/") || file.startsWith("src/compat/"))
    new vm.Script(source, { filename: file });
  else {
    const r = spawnSync(process.execPath, ["--check", file], {
      encoding: "utf8",
    });
    if (r.status) throw new Error(r.stderr);
  }
  if (
    file.startsWith("src/features/") &&
    /\blocalStorage\b|firebase\.initializeApp/.test(source)
  )
    throw new Error(`Unsafe storage/cloud boundary: ${file}`);
}
for (const file of [
  "index.html",
  ...files.filter(
    (f) =>
      f.endsWith(".js") && !f.includes("/features/") && !f.includes("/compat/"),
  ),
]) {
  const source = await fs.readFile(file, "utf8");
  for (const m of source.matchAll(
    /(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g,
  )) {
    if (!m[1].startsWith(".")) continue;
    await fs.access(path.resolve(path.dirname(file), m[1]));
  }
}
console.log(`Syntax and import checks passed (${files.length} source files).`);
