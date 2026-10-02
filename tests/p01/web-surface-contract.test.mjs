import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../../apps/web/index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../../apps/web/styles.css',import.meta.url),'utf8');
const js=await readFile(new URL('../../apps/web/app.mjs',import.meta.url),'utf8');
const adapter=await readFile(new URL('../../apps/web/src/p01/browser-journey.mjs',import.meta.url),'utf8');
const player=await readFile(new URL('../../apps/web/src/p01/lesson-player.mjs',import.meta.url),'utf8');

test('P01 browser surface is mobile-first and wired to the canonical journey adapter',()=>{
 assert.match(html,/viewport/); assert.match(html,/app\.mjs/); assert.match(css,/@media\(max-width:600px\)/);
 assert.match(js,/createBrowserP01Journey/); assert.match(js,/CONFIRM_ADULT_CONSENT/); assert.match(js,/ANSWER_ASSESSMENT/); assert.match(js,/BUILD_CONTROL_MAP/); assert.match(js,/START_L01/); assert.match(js,/START_L02/); assert.match(js,/START_PRACTICE/); assert.match(js,/COMPLETE_PRACTICE/); assert.match(js,/VIEW_OFFER/);
});

test('P01 browser adapter uses canonical domain packages, versioned content, and lesson players',()=>{
 for(const token of ['createP01FreeJourney','loadInstrument','startAssessment','answerQuestion','buildControlMap','loadLesson','createLessonSession','advanceLesson','evaluateSafety','recommendNextStep','createPracticeRuntime','createLessonPlayer']) assert.match(adapter,new RegExp(token));
 for(const path of ['control-map-v1.json','P01-L01.json','P01-L02.json','safety-v1.json','recommendations-v1.json']) assert.match(adapter,new RegExp(path.replaceAll('.','\\.')));
 assert.match(adapter,/CHECKPOINT_CONFLICT/);
 assert.match(player,/LESSON_PLAYER_NOT_PLAYING/); assert.match(player,/LESSON_PLAYER_COMPLETE/); assert.match(player,/nonSexual/);
});

test('P01 browser surface never uses browser storage or transmits private reflection text',()=>{
 assert.doesNotMatch(js,/localStorage/); assert.doesNotMatch(js,/sessionStorage/); assert.doesNotMatch(js,/fetch\(/); assert.match(js,/REFLECTION_NOT_COLLECTED/); assert.match(js,/PRACTICE_RESULT_NOT_COLLECTED/);
});

test('initial practice remains explicitly non-sexual',()=>assert.match(js,/Prática inicial não sexual/));
