function drPlan(input, svc){
  const map={'95%':['24h','8-24h','Daily backups, single region'],'99%':['12h','4-8h','Daily snapshots + restore tests'],'99.9%':['1h','1-2h','Multi-AZ, hourly backups, warm standby'],'99.99%':['<15m','<30m','Multi-region active-active or active-passive with automated failover']};
  const [rpo,rto,strategy]=map[input.sla]||map['99%']; return {backupStrategy:strategy,rpo,rto,failoverModel:input.sla==='99.99%'?'automated multi-region':'manual/warm standby',regionStrategy:input.region==='global'?'multi-region':'single/multi-AZ',databaseReplication:`${svc.database} replication/snapshots`,restoreTesting:'Run quarterly restore and failover game-days'};
}
module.exports={drPlan};
