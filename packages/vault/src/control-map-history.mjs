export function createControlMapHistory({ save } = {}) {
  if (typeof save !== 'function') throw new Error('HISTORY_SAVE_REQUIRED');
  return {
    async saveSnapshot({ userId, assessmentId, instrumentVersion, map } = {}) {
      if (!userId || !assessmentId || !instrumentVersion || !map || map.status !== 'COMPLETE') throw new Error('MAP_SNAPSHOT_REQUIRED');
      const version = Number(map.version ?? 1);
      if (!Number.isInteger(version) || version < 1) throw new Error('INVALID_MAP_VERSION');
      return save({ userId, assessmentId, instrumentVersion, mapVersion:version, encryptedSnapshot:map });
    }
  };
}
