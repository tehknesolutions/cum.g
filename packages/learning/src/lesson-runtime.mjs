const STAGES = ['LEARN','OBSERVE','PRACTICE','RECORD','REFLECT','COMPARE','ADVANCE'];
const PROVENANCE = new Set(['SCIENTIFIC','EXPERIENTIAL','SOCIAL','HNK']);

export function loadLesson(raw) {
  if (!raw?.lessonCode || !raw?.version || !Array.isArray(raw.blocks)) throw new Error('INVALID_LESSON');
  if (raw.blocks.length !== STAGES.length) throw new Error('INVALID_STAGE_COUNT');
  raw.blocks.forEach((block, index) => {
    if (block.stage !== STAGES[index]) throw new Error('INVALID_STAGE_ORDER');
    if (!PROVENANCE.has(block.provenanceClass)) throw new Error('INVALID_PROVENANCE');
    if (block.provenanceClass === 'SCIENTIFIC' && (!Array.isArray(block.claimRefs) || block.claimRefs.length === 0)) throw new Error('SCIENTIFIC_CLAIM_REQUIRED');
    if (block.stage === 'PRACTICE' && block.nonSexual !== true) throw new Error('INITIAL_PRACTICE_MUST_BE_NON_SEXUAL');
  });
  return structuredClone(raw);
}

export function createLessonSession(lesson) {
  if (!lesson?.blocks?.length) throw new Error('INVALID_LESSON');
  return {
    lessonCode: lesson.lessonCode,
    lessonVersion: lesson.version,
    lesson,
    currentIndex: 0,
    currentStage: lesson.blocks[0].stage,
    completedStages: [],
    status: 'IN_PROGRESS',
  };
}

export function advanceLesson(session, { stage, completed } = {}) {
  if (session?.status !== 'IN_PROGRESS') throw new Error('LESSON_NOT_IN_PROGRESS');
  if (stage !== session.currentStage) throw new Error('STAGE_MISMATCH');
  if (completed !== true) throw new Error('STAGE_NOT_COMPLETE');
  const next = { ...session, completedStages: [...session.completedStages, stage] };
  next.currentIndex += 1;
  if (next.currentIndex >= session.lesson.blocks.length) {
    next.currentStage = null;
    next.status = 'COMPLETE';
  } else {
    next.currentStage = session.lesson.blocks[next.currentIndex].stage;
  }
  return next;
}
