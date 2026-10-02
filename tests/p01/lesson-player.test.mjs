import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLesson } from '../../packages/learning/src/lesson-runtime.mjs';
import { createLessonPlayer, lessonBlockPresentation } from '../../apps/web/src/p01/lesson-player.mjs';
import { readFile } from 'node:fs/promises';

const raw=JSON.parse(await readFile(new URL('../../content/courses/CUMG-P01/lessons/P01-L01.json',import.meta.url),'utf8'));

test('lesson player follows the canonical seven-stage lesson without duplicating content',()=>{
 const lesson=loadLesson(raw); let completed;
 const player=createLessonPlayer(lesson,{onComplete:event=>{completed=event;}});
 assert.equal(player.getState().status,'READY');
 assert.equal(player.getState().total,7);
 player.start();
 for(let i=0;i<7;i++){const state=player.getState();assert.equal(state.block.stage,['LEARN','OBSERVE','PRACTICE','RECORD','REFLECT','COMPARE','ADVANCE'][i]);const view=lessonBlockPresentation(state.block);assert.equal(view.contentKey,state.block.contentKey);player.completeStage();}
 assert.equal(player.getState().status,'COMPLETED');
 assert.equal(completed.lessonCode,'P01-L01');
});

test('initial practice presentation remains non-sexual and carries canonical instructions',()=>{
 const lesson=loadLesson(raw); const practice=lessonBlockPresentation(lesson.blocks[2]);
 assert.equal(practice.stage,'PRACTICE'); assert.equal(practice.nonSexual,true); assert.deepEqual(practice.instructions,['NOTICE_BREATH_WITHOUT_FORCING','NOTICE_BODY_TENSION','RETURN_ATTENTION_GENTLY']);
});

test('player cannot skip ahead without starting and completing current stage',()=>{
 const player=createLessonPlayer(loadLesson(raw));
 assert.throws(()=>player.completeStage(),/LESSON_PLAYER_NOT_PLAYING/);
 player.start(); player.completeStage(); assert.equal(player.getState().block.stage,'OBSERVE');
});
