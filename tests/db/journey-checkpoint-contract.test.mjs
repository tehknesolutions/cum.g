import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync(new URL('../../packages/db/migrations/009_journey_checkpoints.sql',import.meta.url),'utf8');
const rollback=fs.readFileSync(new URL('../../packages/db/rollback/009_journey_checkpoints.down.sql',import.meta.url),'utf8');

test('journey checkpoint schema is private, encrypted, user-owned and immutable',()=>{
 assert.match(migration,/CREATE TABLE cumg_vault\.journey_checkpoints/i);
 assert.match(migration,/user_id uuid NOT NULL REFERENCES identity\.users\(id\) ON DELETE CASCADE/i);
 assert.match(migration,/encrypted_state bytea NOT NULL/i);
 assert.match(migration,/ENABLE ROW LEVEL SECURITY/i);
 assert.match(migration,/FORCE ROW LEVEL SECURITY/i);
 assert.match(migration,/journey_checkpoints_owner_all/i);
 assert.match(migration,/user_id = cumg_vault\.current_user_id\(\)/i);
 assert.match(migration,/JOURNEY_CHECKPOINT_IMMUTABLE/i);
 assert.match(migration,/journey_checkpoint_immutable/i);
});

test('journey checkpoint rollback removes trigger policy index and table',()=>{
 assert.match(rollback,/DROP TRIGGER IF EXISTS journey_checkpoint_immutable/i);
 assert.match(rollback,/DROP POLICY IF EXISTS journey_checkpoints_owner_all/i);
 assert.match(rollback,/DROP INDEX IF EXISTS cumg_vault\.journey_checkpoints_user_created_idx/i);
 assert.match(rollback,/DROP TABLE IF EXISTS cumg_vault\.journey_checkpoints/i);
});
