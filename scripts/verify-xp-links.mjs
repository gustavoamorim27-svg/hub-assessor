import fs from "node:fs/promises";
const tickers = new Set();
const { xpResearch: previous } = await import("../src/data/xp-links.js");
async function scan(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) await scan(p);
    else if (e.name.endsWith(".js")) {
      for (const m of (await fs.readFile(p, "utf8")).matchAll(
        /\b[A-Z]{4}\d{1,2}\b/g,
      ))
        tickers.add(m[0]);
    }
  }
}
await scan("src/features");
tickers.delete("FBBF24"); // hexadecimal color, not a security
const queue = [...tickers].sort(),
  links = {},
  missing = [];
async function worker() {
  while (queue.length) {
    const ticker = queue.shift();
    let found = false;
    for (const category of ["acoes", "fundos-imobiliarios"]) {
      const url = `https://conteudos.xpi.com.br/${category}/${ticker.toLowerCase()}/`;
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
        const body = await r.text();
        const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
        if (
          r.ok &&
          new URL(r.url).hostname === "conteudos.xpi.com.br" &&
          title.toUpperCase().includes(ticker)
        ) {
          links[ticker] = r.url;
          found = true;
          break;
        }
      } catch {}
    }
    if (!found) missing.push(ticker);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
const data = {
  ...previous,
  checkedAt: new Date().toISOString().slice(0, 10),
  links,
  missing,
};
await fs.mkdir("src/data", { recursive: true });
await fs.writeFile(
  "src/data/xp-links.js",
  `// Links verified against XP page titles.\nexport const xpResearch = ${JSON.stringify(data, null, 2)};\n`,
);
console.log(JSON.stringify({ verified: Object.keys(links).length, missing }));
