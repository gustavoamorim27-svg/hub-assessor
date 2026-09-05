import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {researchFor,assetResearchLink} from '../src/services/xp-research.js';

test('XP links resolve tickers and fall back without inventing unknown URLs',()=>{
  assert.equal(researchFor({nome:'Banco do Brasil — BBAS3'}).url,'https://conteudos.xpi.com.br/acoes/bbas3/');
  assert.match(researchFor({ticker:'XXXX99',nome:'BBAS3'}).url,/raio-xp/);
  assert.match(researchFor({nome:'CDB banco'}).label,/Raio-XP/);
  assert.ok(!assetResearchLink({nome:'<script>alert(1)</script>'}).includes('<script>'));
});

test('successive PNG exports apply saved light and vivid colors without recoloring live charts',async()=>{
  class Context {
    get fillStyle(){return this.fill;}
    set fillStyle(v){this.fill=v;}
    get strokeStyle(){return this.stroke;}
    set strokeStyle(v){this.stroke=v;}
    createLinearGradient(){return {stops:[],addColorStop(o,c){this.stops.push([o,c]);}};}
  }
  class Canvas { constructor(connected=false){this.isConnected=connected;this.ctx=new Context();}getContext(){return this.ctx;} }
  const window={hubStorage:{getItem:()=> 'claro'}};
  const env=vm.createContext({window,HTMLCanvasElement:Canvas,CanvasRenderingContext2D:Context,document:{readyState:'complete',getElementById:()=>null}});
  vm.runInContext(await fs.readFile('src/compat/png-theme.js','utf8'),env);
  const light=new Canvas().getContext('2d');light.fillStyle='#fff';assert.equal(light.fillStyle,'#12233F');
  light.fillStyle='#0b1030';assert.equal(light.fillStyle,'#FDF7F0');
  window.__hubPngTema='viva';
  const vivid=new Canvas().getContext('2d');
  const gradient=vivid.createLinearGradient();gradient.addColorStop(0,'#0a0f38');assert.equal(gradient.stops[0][1],'#41151a');
  const live=new Canvas(true).getContext('2d');live.fillStyle='#0a0f38';assert.equal(live.fillStyle,'#0a0f38');
  window.__hubPngTema='escuro';const dark=new Canvas().getContext('2d');dark.fillStyle='#fff';assert.equal(dark.fillStyle,'#fff');
});
