export function createPrivateReflectionVault({ save } = {}) {
  if (typeof save !== 'function') throw new Error('VAULT_SAVE_REQUIRED');
  return {
    async saveReflection({ userId, lessonCode, record }) {
      if (!userId || !lessonCode || !record) throw new Error('PRIVATE_RECORD_REQUIRED');
      return save({
        userId,
        lessonCode,
        recordVersion: 1,
        encryptedPayload: record,
      });
    },
  };
}
