import fs from 'node:fs/promises';
import path from 'node:path';

const publishedFile = path.resolve('../hub-gustavo-amorim/index.html');
const files = [
  'src/compat/tools.css',
  'src/features/construtor/asset-library.js',
  'src/features/construtor/engine.js',
  'src/features/construtor/view.html',
  'src/features/holdingcalc/engine.js',
  'src/features/holdingcalc/view.html',
  'src/styles/workbench.css',
];

const html = await fs.readFile(publishedFile, 'utf8');
const startMarker = 'window.__hubAssets=';
const endMarker = ';window.__hubAsset=';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);

if (start < 0 || end < start) {
  throw new Error('O mapa de recursos da versão publicada não foi encontrado.');
}

const assets = JSON.parse(html.slice(start + startMarker.length, end));

for (const file of files) {
  const url = assets[file];
  if (!url || !url.startsWith('data:') || !url.includes(';base64,')) {
    throw new Error(`Recurso publicado ausente ou inválido: ${file}`);
  }
  const body = Buffer.from(url.split(';base64,')[1], 'base64').toString('utf8');
  if (body.includes('data:text/html;base64,')) {
    throw new Error(`Recurso contém conteúdo empacotado e não pode ser sincronizado: ${file}`);
  }
  await fs.writeFile(path.resolve(file), body);
}

console.log(JSON.stringify({ source: publishedFile, synchronized: files }));
