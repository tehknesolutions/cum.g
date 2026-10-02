export function createPostgresControlMapHistory({ query, encrypt, decrypt, createId } = {}) {
  if (typeof query !== 'function') throw new Error('DB_QUERY_REQUIRED');
  if (typeof encrypt !== 'function') throw new Error('ENCRYPT_REQUIRED');
  if (typeof decrypt !== 'function') throw new Error('DECRYPT_REQUIRED');
  if (typeof createId !== 'function') throw new Error('CREATE_ID_REQUIRED');

  return {
    async saveSnapshot({ userId, assessmentId, instrumentVersion, map } = {}) {
      if (!userId || !assessmentId || !instrumentVersion || !map || map.status !== 'COMPLETE') throw new Error('MAP_SNAPSHOT_REQUIRED');
      const mapVersion = Number(map.version ?? 1);
      if (!Number.isInteger(mapVersion) || mapVersion < 1) throw new Error('INVALID_MAP_VERSION');

      const encryptedSnapshot = await encrypt(map);
      const sql = 'INSERT INTO cumg_vault.control_maps (id, user_id, assessment_id, instrument_version, encrypted_snapshot, map_version) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, assessment_id, instrument_version, map_version, created_at';
      const result = await query(sql, [createId(), userId, assessmentId, instrumentVersion, encryptedSnapshot, mapVersion]);
      return result?.rows?.[0] ?? null;
    },

    async loadLatestSnapshot({ userId } = {}) {
      if (!userId) throw new Error('USER_ID_REQUIRED');
      const sql = 'SELECT id, instrument_version, encrypted_snapshot, map_version, created_at FROM cumg_vault.control_maps WHERE user_id = $1 ORDER BY map_version DESC LIMIT 1';
      const result = await query(sql, [userId]);
      const row = result?.rows?.[0];
      if (!row) return null;
      const map = await decrypt(row.encrypted_snapshot);
      if (!map || map.status !== 'COMPLETE') throw new Error('INVALID_DECRYPTED_MAP_SNAPSHOT');
      return { id:row.id, version:row.map_version, instrumentVersion:row.instrument_version, createdAt:row.created_at, map };
    }
  };
}
