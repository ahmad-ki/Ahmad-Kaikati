function serviceMap(input, deployment) {
  const nosql = input.consistency === 'NoSQL' || input.dataSize === 'large';
  const kafka = input.architecture === 'microservices' && input.dataSize === 'large';

  return {
    provider: 'On-premise / Local',
    compute:
      deployment.model === 'Kubernetes'
        ? 'k3s / kubeadm / OpenShift'
        : deployment.model === 'Docker Containers'
        ? 'Docker Compose'
        : 'VMware/Proxmox VMs',
    database: nosql ? 'MongoDB ReplicaSet' : 'PostgreSQL HA with Patroni/repmgr',
    cache: 'Redis Sentinel',
    queue: kafka ? 'Kafka KRaft' : 'RabbitMQ Cluster',
    cdn: 'Cloudflare proxy mode',
    lb: 'HAProxy / NGINX / MetalLB',
    dns: 'Bind / PowerDNS / Cloudflare',
    auth: 'Keycloak',
    secrets: 'Vault',
    monitoring: 'Prometheus + Grafana + Loki',
    storage: 'MinIO / Ceph / NFS',
    waf: 'ModSecurity / Cloudflare WAF'
  };
}

module.exports = { serviceMap };