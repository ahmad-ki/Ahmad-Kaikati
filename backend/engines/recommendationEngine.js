function recommendations(input, provider, deployment, cost){
  const rec=[{level:'info',text:`Selected ${provider} with ${deployment.model}: ${deployment.reason}`}];
  if(input.sla==='99.99%') rec.push({level:'critical',text:'99.99% SLA requires multi-region failover, automated health checks, and tested DR runbooks.'});
  if(input.costPriority==='cheapest') rec.push({level:'warning',text:'Cheapest mode reduces managed-service cost but increases operational risk and manual recovery effort.'});
  if(cost.monthly>5000) rec.push({level:'warning',text:'Monthly cost is high; evaluate reserved capacity/savings plans and autoscaling policies.'});
  if(input.compliance && input.compliance!=='None') rec.push({level:'info',text:`Compliance ${input.compliance}: enable audit logs, encryption, key rotation, and policy-as-code.`});
  return rec;
}
module.exports={recommendations};
