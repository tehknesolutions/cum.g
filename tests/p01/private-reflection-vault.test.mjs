import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrivateReflectionVault } from '../../packages/vault/src/private-reflection-vault.mjs';

test('vault adapter forwards only the private record boundary',async()=>{
  let received;
  const vault=createPrivateReflectionVault({save:async(input)=>(received=input,{id:'r1'})});
  const result=await vault.saveReflection({userId:'u1',lessonCode:'P01-L02',record:{reflection:'private'}});
  assert.equal(result.id,'r1');
  assert.equal(received.userId,'u1');
  assert.equal(received.lessonCode,'P01-L02');
  assert.deepEqual(received.encryptedPayload,{reflection:'private'});
});

test('vault adapter rejects incomplete private records',async()=>{
  const vault=createPrivateReflectionVault({save:async(input)=>input});
  await assert.rejects(()=>vault.saveReflection({userId:'u1',lessonCode:'P01-L02'}),/PRIVATE_RECORD_REQUIRED/);
});
