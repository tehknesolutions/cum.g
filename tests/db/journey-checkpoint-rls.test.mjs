import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration=await readFile(new URL('../../packages/db/migrations/010_journey_checkpoint_runtime.sql',import.meta.url),'utf8');
const rollback=await readFile(new URL('../../packages/db/rollback/010_journey_checkpoint_runtime.down.sql',import.meta.url),'utf8');
const schema=await readFile(new URL('../../packages/db/migrations/009_journey_checkpoints.sql',import.meta.url),'utf8');

test('authenticated runtime receives only table grants while RLS remains authoritative',()=>{
 assert.match(migration,/GRANT SELECT, INSERT, UPDATE, DELETE ON cumg_vault\.journey_checkpoints TO authenticated/i);
 assert.match(schema,/FORCE ROW LEVEL SECURITY/i);
 assert.match(schema,/user_id = cumg_vault\.current_user_id\(\)/i);
 assert.doesNotMatch(migration,/GRANT .* TO anon/i);
});

test('runtime rollback revokes checkpoint table privileges',()=>{
 assert.match(rollback,/REVOKE SELECT, INSERT, UPDATE, DELETE ON cumg_vault\.journey_checkpoints FROM authenticated/i);
});
