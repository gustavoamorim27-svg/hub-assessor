import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const publishedFile = path.resolve('../hub-gustavo-amorim/index.html');
const enhancementFile = path.resolve('src/live-enhancements.html');
const runtimeFiles = [
  'src/features/construtor/asset-library.js',
  'src/features/construtor/engine.js',
];
const expectedPublishedHashes = {
  'src/features/construtor/asset-library.js':
    '479da1d98e71f53c58871f39d3bc4c58ebb6b89981093816e749167a8023c295',
  'src/features/construtor/engine.js':
    'e07036998bcb9438863e13f81b271ef67e2fdf829860c5df4774d48232eaec5a',
};

function decodeAsset(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma < 0 || !dataUrl.slice(0, comma).includes(';base64')) {
    throw new Error('Recurso publicado em formato inesperado.');
  }
  return Buffer.from(dataUrl.slice(comma + 1), 'base64');
}

function sha256(body) {
  return crypto.createHash('sha256').update(body).digest('hex');
}

let html = await fs.readFile(publishedFile, 'utf8');
const startMarker = 'window.__hubAssets=';
const endMarker = ';window.__hubAsset=';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);

if (start < 0 || end < start) {
  throw new Error('O mapa de recursos da versão publicada não foi encontrado.');
}

const assets = JSON.parse(html.slice(start + startMarker.length, end));
for (const file of runtimeFiles) {
  const publishedHash = sha256(decodeAsset(assets[file] || ''));
  if (publishedHash !== expectedPublishedHashes[file]) {
    throw new Error(
      `Publicação interrompida: ${file} mudou no GitHub desde a sincronização. Faça a mesclagem antes de publicar.`,
    );
  }
  const body = await fs.readFile(path.resolve(file), 'utf8');
  assets[file] = `data:text/${file.endsWith('.js') ? 'javascript' : 'plain'};base64,${Buffer.from(body).toString('base64')}`;
}

html =
  html.slice(0, start + startMarker.length) +
  JSON.stringify(assets) +
  html.slice(end);

const enhancement = (await fs.readFile(enhancementFile, 'utf8')).trim();
if (!html.includes('id="scroll-depth-css"')) {
  html = html.replace('</body>', `${enhancement}\n</body>`);
}

await fs.writeFile(publishedFile, html);
console.log(
  JSON.stringify({
    output: publishedFile,
    patchedRuntime: runtimeFiles,
    enhancementInjected: true,
  }),
);
