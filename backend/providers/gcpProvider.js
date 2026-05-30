function serviceMap(input, deployment) {
  const nosql = input.consistency === 'NoSQL' || input.dataSize === 'large';

  return {
    provider: 'GCP (GKE/Cloud Run/Compute)',
    compute:
      deployment.model === 'Serverless'
        ? 'Cloud Functions'
        : deployment.model === 'Kubernetes'
        ? 'GKE'
        : deployment.model === 'Docker Containers'
        ? 'Cloud Run'
        : 'Compute Engine',
    database: nosql ? 'Firestore' : 'Cloud SQL PostgreSQL',
    cache: 'Memorystore Redis',
    queue: 'Pub/Sub',
    cdn: 'Cloud CDN',
    lb: 'Cloud Load Balancing',
    dns: 'Cloud DNS',
    auth: 'Identity Platform',
    secrets: 'Secret Manager',
    monitoring: 'Cloud Monitoring + Logging + Trace',
    storage: 'Cloud Storage',
    waf: 'Cloud Armor'
  };
}

module.exports = { serviceMap };