const fs=require('fs'); const path=require('path');
const { scaleIndex,scaleTier,trafficGb,storageGb } = require('../utils/scaleUtils');
function load(provider){ const map={AWS:'aws-pricing.json',Azure:'azure-pricing.json',GCP:'gcp-pricing.json','On-premise / Local':'onprem-pricing.json'}; return JSON.parse(fs.readFileSync(path.join(__dirname,'../pricing',map[provider]||map.AWS),'utf8')); }
function estimateCost(input, provider, deployment, sizing){
  const p=load(provider==='Hybrid'||provider==='Multi-cloud'?'AWS':provider); const scale=scaleIndex(input.users); const tier=scaleTier(scale); const hrs=730;
  const ha=input.sla==='99.99%'?2.4:input.sla==='99.9%'?1.55:input.sla==='99%'?1.15:1;
  const region=input.region==='global'?1.7:1; const enterprise=input.costPriority==='enterprise'?1.25:1; const perf=input.costPriority==='performance'?1.18:1;
  const nodes=sizing.node_count||1; const pods=(sizing.frontend_pods||1)+(sizing.backend_pods||1)+(sizing.worker_pods||0);
  const compute=Math.round((p.compute[tier]||p.compute.medium)*hrs*nodes*ha*region*perf);
  const database=Math.round((p.database[tier]||p.database.medium)*ha*region*enterprise);
  const storage=Math.round((p.storagePerGb||0.02)*storageGb(scale,input.dataSize));
  const egress=Math.round((p.egressPerGb||0.08)*trafficGb(scale,input.trafficPattern)*region);
  const loadBalancer=Math.round((p.loadBalancer||25)*(input.region==='global'?2:1));
  const cdn=Math.round((p.cdnBase||20)*(input.latency==='low'||input.region==='global'?2:1));
  const cache=Math.round((p.cache[tier]||p.cache.medium)*(input.dataSize==='small'?0.5:1));
  const queue=Math.round((input.architecture==='microservices'||input.trafficPattern==='burst')?(input.dataSize==='large'?p.queue.streaming:p.queue.managed):p.queue.basic);
  const monitoring=Math.round((p.monitoringPerPod||3)*pods);
  const waf=p.waf||25; const k8s=deployment.model==='Kubernetes'?(p.kubernetesControlPlane||0):0;
  const backup=Math.round(database*(p.backupPercent||0.15)); const ops=provider==='On-premise / Local'?(p.opsPremium||250):0;
  const breakdown={compute,database,storage,egress,loadBalancer,cdn,cache,queue,monitoring,backup,waf,kubernetesControlPlane:k8s,operations:ops};
  const monthly=Object.values(breakdown).reduce((a,b)=>a+b,0); return {monthly,yearly:monthly*12,total:monthly,breakdown,assumptions:['730 hours/month','Local catalog estimate, not live vendor API','HA, region, traffic, and storage multipliers applied'],accuracy:'estimated',currency:'USD',pricingSource:'local catalog estimate'};
}
module.exports={estimateCost};
