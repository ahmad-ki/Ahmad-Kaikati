function buildDiagram(input, provider, svc){
  const label = provider==='AWS'?'AWS':provider==='Azure'?'Azure':provider==='GCP'?'GCP':provider.includes('On-prem')?'OnPrem':provider;
  const lines=['graph TD','  User([User])'];
  if(provider==='AWS'){ lines.push('  User --> DNS[Route53]','  DNS --> CDN[CloudFront + AWS WAF]','  CDN --> LB[ALB/NLB]'); }
  else if(provider==='Azure'){ lines.push('  User --> DNS[Azure DNS / Traffic Manager]','  DNS --> CDN[Azure Front Door + WAF]','  CDN --> LB[Application Gateway]'); }
  else if(provider==='GCP'){ lines.push('  User --> DNS[Cloud DNS]','  DNS --> CDN[Cloud CDN + Cloud Armor]','  CDN --> LB[Cloud Load Balancing]'); }
  else if(provider==='Hybrid'){ lines.push('  User --> Edge[Cloudflare / Global DNS]','  Edge --> Cloud[Cloud API Tier]','  Cloud --> VPN[VPN / ExpressRoute / Direct Connect]','  VPN --> LB[On-prem HAProxy / NGINX]'); }
  else if(provider==='Multi-cloud'){ lines.push('  User --> Edge[Cloudflare Global DNS + WAF]','  Edge --> AWS[AWS Primary Region]','  Edge --> Azure[Azure DR Region]','  AWS --> GCP[GCP Analytics / Data Services]'); return finish(lines, provider); }
  else { lines.push('  User --> Edge[Cloudflare / DNS]','  Edge --> LB[HAProxy / NGINX / MetalLB]'); }
  lines.push(`  LB --> Compute[${svc.compute}]`,`  Compute --> DB[${svc.database}]`,`  Compute --> Cache[${svc.cache}]`,`  Compute --> Queue[${svc.queue}]`,`  Compute --> Storage[${svc.storage}]`,`  Compute --> Mon[${svc.monitoring}]`);
  return finish(lines, provider);
}
function finish(lines, provider){return {mermaid:lines.join('
'),providerStyle:provider+' reference-style generated diagram',diagramType:provider.toLowerCase().replace(/[^a-z]/g,''),nodes:[],edges:[]};}
module.exports={buildDiagram};
