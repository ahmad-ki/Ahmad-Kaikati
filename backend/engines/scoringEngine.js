function scoreProviders(input) {
  const scores={AWS:{cost:70,performance:85,latency:85,reliability:88,globalReach:92,ops:70,security:85,total:0},Azure:{cost:68,performance:82,latency:82,reliability:87,globalReach:88,ops:72,security:90,total:0},GCP:{cost:72,performance:84,latency:88,reliability:84,globalReach:86,ops:74,security:84,total:0},'On-premise / Local':{cost:82,performance:65,latency:70,reliability:68,globalReach:45,ops:45,security:70,total:0}};
  const reasoning=[];
  if (input.region==='global') { scores.AWS.globalReach+=8; scores.GCP.latency+=6; reasoning.push('Global region increases AWS/GCP edge and backbone scores.'); }
  if (input.auth==='SSO' || input.compliance!=='None') { scores.Azure.security+=8; reasoning.push('Enterprise identity/compliance improves Azure score.'); }
  if (input.budget==='low' || input.costPriority==='cheapest') { scores['On-premise / Local'].cost+=10; scores.GCP.cost+=5; reasoning.push('Low budget increases On-prem/GCP cost score.'); }
  if (input.sla==='99.99%') { scores.AWS.reliability+=8; scores.Azure.reliability+=6; reasoning.push('Mission-critical SLA favors mature managed multi-region services.'); }
  if (input.latency==='realtime') { scores.GCP.latency+=7; scores.AWS.latency+=4; reasoning.push('Realtime latency improves GCP/AWS scoring.'); }
  for (const p of Object.keys(scores)) { const s=scores[p]; s.total=Math.round(s.cost*.2+s.performance*.18+s.latency*.14+s.reliability*.2+s.globalReach*.12+s.ops*.08+s.security*.08); }
  const selected=Object.entries(scores).sort((a,b)=>b[1].total-a[1].total)[0][0];
  return { selected, scores, reasoning };
}
module.exports={scoreProviders};
