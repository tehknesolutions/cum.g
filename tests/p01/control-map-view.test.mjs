import test from 'node:test';
import assert from 'node:assert/strict';
import { createControlMapView } from '../../apps/web/src/p01/control-map-view.mjs';

test('control map view exposes exactly seven educational dimensions and no clinical aggregate',()=>{
 const map={status:'COMPLETE',version:2,instrumentVersion:'1.0.0',updateSource:'PRACTICE_FEEDBACK',dimensions:{bodyAwareness:{value:10,interpretationKey:'P01.CONTROL_MAP.bodyAwareness.EXPLORE'},arousalAwareness:{value:34,interpretationKey:'P01.CONTROL_MAP.arousalAwareness.DEVELOP'},selfRegulation:{value:66,interpretationKey:'P01.CONTROL_MAP.selfRegulation.DEVELOP'},mentalAttention:{value:67,interpretationKey:'P01.CONTROL_MAP.mentalAttention.STRENGTHEN'},emotionalResponse:{value:50,interpretationKey:'P01.CONTROL_MAP.emotionalResponse.DEVELOP'},contextCommunication:{value:80,interpretationKey:'P01.CONTROL_MAP.contextCommunication.STRENGTHEN'},perceivedConfidence:{value:33,interpretationKey:'P01.CONTROL_MAP.perceivedConfidence.EXPLORE'}}};
 const view=createControlMapView(map);
 assert.equal(view.total,7); assert.equal(view.version,2); assert.equal(view.updatedBy,'PRACTICE_FEEDBACK'); assert.equal(view.dimensions[0].label,'Consciência corporal'); assert.equal(view.dimensions[0].bandLabel,'Explorar'); assert.equal(Object.hasOwn(view,'score'),false); assert.equal(Object.hasOwn(view,'diagnosis'),false); assert.match(view.disclaimer,/não é diagnóstico/);
});
