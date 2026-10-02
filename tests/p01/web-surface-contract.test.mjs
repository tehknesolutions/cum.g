import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../../apps/web/index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../../apps/web/styles.css',import.meta.url),'utf8');
const js=await readFile(new URL('../../apps/web/app.mjs',import.meta.url),'utf8');

test('P01 browser surface is mobile-first and wired to the journey module',()=>{
 assert.match(html,/viewport/); assert.match(html,/app\.mjs/); assert.match(css,/@media\(max-width:600px\)/);
 assert.match(js,/Controle Ejaculatório/); assert.match(js,/age-consent/); assert.match(js,/control-map/); assert.match(js,/P01-L01/); assert.match(js,/P01-L02/); assert.match(js,/practice-result/); assert.match(js,/safety-guidance/); assert.match(js,/offer/);
});

test('P01 browser surface does not expose private reflection payloads or persist offer state',()=>{
 assert.match(js,/Reflexão privada/); assert.match(js,/Vault privado/); assert.match(js,/não coleta o texto/); assert.match(js,/não é transformada em dado genérico de analytics/); assert.match(js,/offer/);
 assert.doesNotMatch(js,/localStorage/); assert.doesNotMatch(js,/sessionStorage/); assert.doesNotMatch(js,/fetch\(/);
});

test('initial practice is explicitly non-sexual',()=>{ assert.match(js,/Prática inicial não sexual/); assert.match(js,/Sem forçar/); });
