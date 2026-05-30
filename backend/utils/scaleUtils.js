const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function scaleIndex(users='10K') { return clamp(['100','1K','10K','100K','1M'].indexOf(users),0,4); }
function scaleTier(scale) { return ['small','small','medium','large','enterprise'][scale] || 'medium'; }
function trafficGb(scale, trafficPattern='constant') {
  const base=[50,150,800,5000,50000][scale] || 800;
  const mult=trafficPattern==='burst'?2.2:trafficPattern==='peak'?1.5:1;
  return Math.round(base*mult);
}
function storageGb(scale,dataSize='medium') {
  const base={small:[20,40,80,200,800],medium:[50,100,300,1000,5000],large:[200,500,1500,8000,30000]};
  return base[dataSize]?.[scale] || 300;
}
module.exports={clamp,scaleIndex,scaleTier,trafficGb,storageGb};
