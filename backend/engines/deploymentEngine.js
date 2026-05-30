const { scaleIndex } = require('../utils/scaleUtils');
function recommendDeployment(input) {
  if (input.deploymentModel !== 'Auto-recommend') return explicit(input.deploymentModel, input);
  const scale=scaleIndex(input.users);
  let model='Docker Containers', reason='Balanced default for modern applications.';
  if (scale<=1 && input.budget==='low' && ['95%','99%'].includes(input.sla)) { model='Traditional VMs'; reason='Small scale, low budget, and modest SLA keep operations simple and cheap.'; }
  else if (scale<=1) { model='Docker Containers'; reason='Small/medium app benefits from repeatable container packaging without Kubernetes overhead.'; }
  else if (scale===2 && input.sla==='95%') { model='Docker Containers'; reason='10K users with low SLA can run on managed containers before Kubernetes is needed.'; }
  else if (scale>=3 || input.architecture==='microservices' || input.sla==='99.99%') { model='Kubernetes'; reason='High scale, microservices, or HA requirement needs orchestration, HPA, and rolling updates.'; }
  if (input.workloads.includes('Real-time APIs') && input.architecture!=='microservices' && scale<=2) { model='Serverless'; reason='Event-driven/realtime moderate workloads can benefit from managed serverless scaling.'; }
  return explicit(model,input,reason);
}
function explicit(model,input,reason) {
  return { model, reason: reason || `User explicitly selected ${model}.`, runtime: model==='Serverless'?'Functions/serverless runtime':model==='Traditional VMs'?'VM runtime':model==='Docker Containers'?'Container runtime':'Container runtime', orchestration: model==='Kubernetes'?(input.cloud==='On-premise / Local'?'k3s/kubeadm/OpenShift':'Managed Kubernetes'):model, opsComplexity: model==='Kubernetes'?'high':model==='Traditional VMs'?'medium':'low' };
}
module.exports={recommendDeployment};
