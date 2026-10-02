export function createPostgresJourneyCheckpoint({ query, encrypt, decrypt, createId } = {}) {
  if (typeof query !== 'function') throw new Error('DB_QUERY_REQUIRED');
  if (typeof encrypt !== 'function') throw new Error('ENCRYPT_REQUIRED');
  if (typeof decrypt !== 'function') throw new Error('DECRYPT_REQUIRED');
  if (typeof createId !== 'function') throw new Error('CREATE_ID_REQUIRED');

  const safeState = (state) => {
    if (!state || typeof state !== 'object') throw new Error('JOURNEY_STATE_REQUIRED');
    if (!state.phase || state.phase === 'ERROR' || state.phase === 'OFFER' || state.offerVisible === true) throw new Error('UNSAFE_JOURNEY_CHECKPOINT');
    return state;
  };

  return {
    async save({ userId, state } = {}) {
      if (!userId) throw new Error('USER_ID_REQUIRED');
      const validState = safeState(state);
      const encryptedState = await encrypt(validState);
      const id = createId();
      const sql = 'INSERT INTO cumg_vault.journey_checkpoints (id, user_id, encrypted_state, state_version) VALUES ($1, $2, $3, $4) RETURNING id, user_id, state_version, created_at';
      const result = await query(sql, [id, userId, encryptedState, 1]);
      return result?.rows?.[0] ?? null;
    },

    async loadLatest({ userId } = {}) {
      if (!userId) throw new Error('USER_ID_REQUIRED');
      const sql = 'SELECT id, encrypted_state, state_version, created_at FROM cumg_vault.journey_checkpoints WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
      const result = await query(sql, [userId]);
      const row = result?.rows?.[0];
      if (!row) return null;
      const state = safeState(await decrypt(row.encrypted_state));
      return { id: row.id, stateVersion: row.state_version, createdAt: row.created_at, state };
    }
  };
}
