import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

const output = path.resolve('../../outputs/gustavo-amorim.html');
const assets = {};
const mime = {'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json'};
const data = (body,type) => `data:${type};base64,${Buffer.from(body).toString('base64')}`;
async function collect(dir) {
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const file = `${dir}/${entry.name}`;
    if(entry.isDirectory()) await collect(file);
    else if(mime[path.extname(file)]) assets[file] = await fs.readFile(file,'utf8');
  }
}
await collect('src'); await collect('vendor');
assets['news.json']=await fs.readFile('news.json','utf8');
assets['apresentacao.html']=await fs.readFile('apresentacao.html','utf8');
const presentation=data(assets['apresentacao.html'],'text/html');
for(const file of Object.keys(assets)) {
  if(file!=='apresentacao.html') assets[file]=assets[file].replaceAll('"apresentacao.html"',JSON.stringify(presentation));
}
const urls=Object.fromEntries(Object.entries(assets).map(([file,body])=>[file,data(body,mime[path.extname(file)])]));
const modules=new Map();
async function bundle(file) {
  if(modules.has(file)) return modules.get(file);
  let code=assets[file];
  if(code===undefined) throw new Error(`Missing module ${file}`);
  code=code.replace('new URL("../ui/rico.svg", import.meta.url).href',JSON.stringify(urls['src/ui/rico.svg']));
  code=code.replaceAll('"./src/ui/rico.svg"',JSON.stringify(urls['src/ui/rico.svg']));
  if(file==='src/services/tool-loader.js') {
    code=code.replace('new URL(path, document.baseURI).href','window.__hubAsset(path)');
    code=code.replace('el.href = path','el.href = window.__hubAsset(path)');
    code=code.replace('fetch(`./src/features/${id}/${file}.html`)','fetch(window.__hubAsset(`./src/features/${id}/${file}.html`))');
  }
  code=code.replace('fetch("./news.json")','fetch(window.__hubAsset("./news.json"))');
  const re=/(\bfrom\s*|\bimport\s*\(\s*)(["'])(\.[^"']+)\2/g;
  const matches=[...code.matchAll(re)];
  for(const match of matches.reverse()) {
    const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),match[3]));
    const replacement=match[1]+JSON.stringify(await bundle(dependency));
    code=code.slice(0,match.index)+replacement+code.slice(match.index+match[0].length);
  }
  const result=data(code,'text/javascript');modules.set(file,result);return result;
}
const app=await bundle('src/app.js');
let html=await fs.readFile('index.html','utf8');
html=html.replace(/<link rel="stylesheet" href="\.\/(src\/[^" ]+)"\s*\/>/g,(_,file)=>`<style>${assets[file]}</style>`);
html=html.replace('href="./src/ui/favicon.svg"',`href="${urls['src/ui/favicon.svg']}"`);
// Only lazy-loaded resources belong in the runtime map; ES modules are bundled above.
const runtime=Object.fromEntries(Object.entries(urls).filter(([file])=>file.startsWith('vendor/')||file.startsWith('src/features/')||file.startsWith('src/compat/')||file==='src/styles/workbench.css'||file==='news.json'));
const bootstrap=`window.__hubAssets=${JSON.stringify(runtime)};window.__hubAsset=p=>{const k=p.replace(/^\\.\\//,'');if(!window.__hubAssets[k])throw new Error('Recurso ausente: '+k);return window.__hubAssets[k];};`;
html=html.replace('<script type="module" src="./src/app.js"></script>',`<script>${bootstrap}</script><script type="module" src="${app}"></script>`);
html=html.replace('<title>Hub do Assessor · Estúdio</title>','<title>Gustavo Amorim · Hub do Assessor</title>');
parse(html);
if(/(?:src|href)="\.\//.test(html)) throw new Error('Unresolved local reference');
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,html);
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),bundledModules:modules.size,embeddedResources:Object.keys(runtime).length}));
