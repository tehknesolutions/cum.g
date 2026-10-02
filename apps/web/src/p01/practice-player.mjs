const PLAYER_STATES=['READY','IN_PROGRESS','COMPLETE'];

export function createPracticePlayer(runtime){
  if(!runtime?.getState||!runtime?.start||!runtime?.complete) throw new Error('INVALID_PRACTICE_RUNTIME');
  const snapshot=()=>runtime.getState();
  return {
    getState:snapshot,
    start(){return runtime.start();},
    complete(){return runtime.complete({completedSteps:3,reflectionRecorded:false});},
    states:[...PLAYER_STATES],
    stepCount:3,
    presentation(){const state=snapshot();return {status:state.status,targetId:state.targetId,dimension:state.dimension,band:state.band,completedSteps:state.completedSteps,totalSteps:3,progress:Math.round((state.completedSteps/3)*100),result:state.result};}
  };
}
