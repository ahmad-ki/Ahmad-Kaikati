const { CLOUDS } = require('./constants');
function normCloud(raw) {
  if (!raw || /%/.test(String(raw))) return 'Best fit (auto)';
  const c=String(raw).toLowerCase().trim();
  if (c.includes('aws')) return 'AWS';
  if (c.includes('azure') || c.includes('aks')) return 'Azure';
  if (c.includes('gcp') || c.includes('google')) return 'GCP';
  if (c.includes('prem') || c.includes('local') || c.includes('on-')) return 'On-premise / Local';
  if (c.includes('hybrid')) return 'Hybrid';
  if (c.includes('multi')) return 'Multi-cloud';
  if (c.includes('auto') || c.includes('best')) return 'Best fit (auto)';
  return 'Best fit (auto)';
}
function oneOf(v, allowed, fallback){ return allowed.includes(v) ? v : fallback; }
function normalizeInput(input={}) {
  const cloudRaw = input.cloudProvider || input.provider || input.selectedCloud || input.cloudPreference || input.cloud;
  return {
    users: oneOf(input.users || '10K', ['100','1K','10K','100K','1M'], '10K'),
    sla: oneOf(input.sla || '99%', ['95%','99%','99.9%','99.99%'], '99%'),
    appType: input.appType || 'E-commerce',
    appTier: input.appTier || 'Dynamic application',
    architecture: oneOf(input.architecture || 'monolith', ['monolith','microservices'], 'monolith'),
    trafficPattern: oneOf(input.trafficPattern || 'constant', ['constant','peak','burst'], 'constant'),
    latency: oneOf(input.latency || 'normal', ['normal','low','realtime'], 'normal'),
    dataSize: oneOf(input.dataSize || 'medium', ['small','medium','large'], 'medium'),
    consistency: oneOf(input.consistency || 'SQL', ['SQL','NoSQL'], 'SQL'),
    auth: input.auth || 'basic',
    region: oneOf(input.region || 'local', ['local','global'], 'local'),
    budget: oneOf(input.budget || 'medium', ['low','medium','high'], 'medium'),
    workloads: Array.isArray(input.workloads) ? input.workloads : [],
    cloud: normCloud(cloudRaw),
    deploymentModel: oneOf(input.deploymentModel || 'Auto-recommend', ['Auto-recommend','Traditional VMs','Docker Containers','Kubernetes','Serverless'], 'Auto-recommend'),
    costPriority: oneOf(input.costPriority || 'balanced', ['cheapest','balanced','performance','enterprise'], 'balanced'),
    environment: oneOf(input.environment || 'Production', ['Dev/Test','Staging','Production','Mission Critical'], 'Production'),
    compliance: input.compliance || 'None',
    diagramMode: oneOf(input.diagramMode || 'Mermaid', ['Mermaid','Provider-style','Reference links'], 'Mermaid')
  };
}
module.exports={normalizeInput,normCloud};
