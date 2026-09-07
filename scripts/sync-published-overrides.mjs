import fs from 'node:fs/promises';
import path from 'node:path';

const publishedFile = path.resolve('../hub-gustavo-amorim/index.html');
const overridesFile = path.resolve('src/published-overrides.html');
const startMarker = '<style id="mercado-css">';

const published = await fs.readFile(publishedFile, 'utf8');
const start = published.indexOf(startMarker);
const end = published.lastIndexOf('</body>');

if (start < 0 || end < start) {
  throw new Error(
    'A camada de personalizações da versão publicada não foi encontrada. Nada foi alterado.',
  );
}

const overrides = `${published.slice(start, end).trim()}\n`;
await fs.writeFile(overridesFile, overrides);

console.log(
  JSON.stringify({
    source: publishedFile,
    output: overridesFile,
    bytes: Buffer.byteLength(overrides),
  }),
);
