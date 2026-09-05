// Extract the exact vector used by the original site; never approximate a wordmark with a font.
import fs from "node:fs/promises";
const source = await fs.readFile("src/compat/brand.js", "utf8");
const match = source.match(/window\.__RICO_LOGO_PATH\s*=\s*("[^"\n]+");/);
if (!match) throw new Error("Original Rico vector not found");
const d = JSON.parse(match[1]);
await fs.writeFile(
  "src/ui/rico.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="505.3 428.8 2944.9 1283.9" fill="#F26522"><path d="${d}"/></svg>\n`,
);
