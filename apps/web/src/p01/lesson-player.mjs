const PLAYER_STATES=['READY','PLAYING','COMPLETED'];

export function createLessonPlayer(lesson,{onComplete=()=>{}}={}){
  if(!lesson?.blocks?.length) throw new Error('INVALID_LESSON_PLAYER');
  let index=0; let status='READY';
  const current=()=>lesson.blocks[index]??null;
  const snapshot=()=>({lessonCode:lesson.lessonCode,lessonVersion:lesson.version,index,total:lesson.blocks.length,status,block:current(),progress:Math.round((index/lesson.blocks.length)*100)});
  return {
    getState:snapshot,
    start(){status='PLAYING';return snapshot();},
    completeStage(){
      if(status!=='PLAYING') throw new Error('LESSON_PLAYER_NOT_PLAYING');
      if(!current()) throw new Error('LESSON_PLAYER_COMPLETE');
      const completed=current(); index+=1;
      if(index>=lesson.blocks.length){status='COMPLETED';onComplete({lessonCode:lesson.lessonCode,lessonVersion:lesson.version,completedBlock:completed});}
      return snapshot();
    },
    reset(){index=0;status='READY';return snapshot();},
    states:[...PLAYER_STATES],
  };
}

export function lessonBlockPresentation(block){
  if(!block) return null;
  return {id:block.id,stage:block.stage,contentKey:block.contentKey,provenanceClass:block.provenanceClass,claimRefs:[...(block.claimRefs??[])],nonSexual:block.nonSexual===true,instructions:[...(block.instructions??[])]};
}
