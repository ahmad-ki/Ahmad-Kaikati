function serviceMap(input, deployment) {
  const nosql = input.consistency === 'NoSQL' || input.dataSize === 'large';
  const kafka = input.architecture === 'microservices' && input.dataSize === 'large';
  return provider:'Azure (AKS/Container Apps/VMs)', compute: deployment.model==='Serverless'?'Azure Functions':deployment.model==='Kubernetes'?'AKS':deployment.model==='Docker Containers'?'Azure Container Apps':'Azure VMs', database: nosql?'Cosmos DB':'Azure Database for PostgreSQL', cache:'Azure Cache for Redis', queue:kafka?'Event Hubs (Kafka API)':'Service Bus', cdn:'Azure Front Door + CDN', lb:'Application Gateway + Load Balancer', dns:'Azure DNS / Traffic Manager', auth:'Microsoft Entra ID', secrets:'Key Vault', monitoring:'Azure Monitor + Log Analytics + App Insights', storage:'Blob Storage', waf:'Front Door WAF / App Gateway WAF';
}
module.exports={serviceMap};
