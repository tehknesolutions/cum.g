const DIMENSION_LABELS={bodyAwareness:'Consciência corporal',arousalAwareness:'Consciência de excitação',selfRegulation:'Autorregulação',mentalAttention:'Atenção mental',emotionalResponse:'Resposta emocional',contextCommunication:'Contexto e comunicação',perceivedConfidence:'Confiança percebida'};
const BAND_LABELS={EXPLORE:'Explorar',DEVELOP:'Desenvolver',STRENGTHEN:'Fortalecer'};

export function createControlMapView(map){
  if(!map||map.status!=='COMPLETE') throw new Error('CONTROL_MAP_REQUIRED');
  const dimensions=Object.entries(map.dimensions).map(([id,data])=>{
    const band=String(data.interpretationKey||'').split('.').pop();
    return {id,label:DIMENSION_LABELS[id]??id,value:data.value,band,bandLabel:BAND_LABELS[band]??band,interpretationKey:data.interpretationKey};
  });
  return {version:map.version??1,instrumentVersion:map.instrumentVersion,dimensions,total:dimensions.length,disclaimer:'Mapa educacional de autorobservação; não é diagnóstico, escore clínico ou medida de desempenho sexual.',updatedBy:map.updateSource??'ASSESSMENT'};
}
