function safe(value, fallback = 'Service') {
  return String(value || fallback)
    .replace(/"/g, '')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')');
}

function buildDiagram(input, provider, svc) {
  if (provider === 'AWS') return buildAwsDiagram(input, svc);
  if (provider === 'Azure') return buildAzureDiagram(input, svc);
  if (provider === 'GCP') return buildGcpDiagram(input, svc);
  if (provider === 'On-premise / Local') return buildOnPremDiagram(input, svc);
  if (provider === 'Hybrid') return buildHybridDiagram(input, svc);
  if (provider === 'Multi-cloud') return buildMultiCloudDiagram(input, svc);

  return buildAwsDiagram(input, svc);
}

function buildAwsDiagram(input, svc) {
  const compute = safe(svc.compute);
  const database = safe(svc.database);
  const cache = safe(svc.cache);
  const queue = safe(svc.queue);
  const storage = safe(svc.storage);
  const monitoring = safe(svc.monitoring);
  const secrets = safe(svc.secrets);
  const waf = safe(svc.waf);

  const lines = [
    'graph TD',

    '  User["Users / Clients"] --> R53["Route53 DNS"]',
    '  R53 --> CF["CloudFront CDN"]',
    `  CF --> WAF["${waf}"]`,
    '  WAF --> ALB["Application Load Balancer / Network Load Balancer"]',

    '  subgraph AWS_EDGE["AWS Edge Layer"]',
    '    R53',
    '    CF',
    '    WAF',
    '  end',

    '  subgraph AWS_NETWORK["AWS VPC / Network Layer"]',
    '    ALB',
    '    NAT["NAT Gateway"]',
    '    SG["Security Groups / Network ACLs"]',
    '  end',

    '  subgraph AWS_COMPUTE["AWS Compute Layer"]',
    `    Compute["${compute}"]`,
    '    Pods["Application Pods / Tasks / Instances"]',
    '    Workers["Background Workers"]',
    '  end',

    '  subgraph AWS_DATA["AWS Data Layer"]',
    `    DB["${database}"]`,
    `    Redis["${cache}"]`,
    `    Queue["${queue}"]`,
    `    S3["${storage}"]`,
    '  end',

    '  subgraph AWS_SECURITY["AWS Security / IAM"]',
    '    IAM["IAM Roles / Policies"]',
    `    Secrets["${secrets}"]`,
    '    KMS["KMS Encryption Keys"]',
    '  end',

    '  subgraph AWS_OBS["AWS Observability"]',
    `    Monitor["${monitoring}"]`,
    '    Logs["Centralized Logs"]',
    '    Traces["Distributed Tracing"]',
    '  end',

    '  ALB --> Compute',
    '  Compute --> Pods',
    '  Pods --> DB',
    '  Pods --> Redis',
    '  Pods --> Queue',
    '  Pods --> S3',
    '  Queue --> Workers',
    '  Pods --> IAM',
    '  Pods --> Secrets',
    '  Secrets --> KMS',
    '  Pods --> Monitor',
    '  Monitor --> Logs',
    '  Monitor --> Traces',

    styleBlock()
  ];

  return finish(lines, 'aws', 'AWS provider-style generated architecture diagram');
}

function buildAzureDiagram(input, svc) {
  const compute = safe(svc.compute);
  const database = safe(svc.database);
  const cache = safe(svc.cache);
  const queue = safe(svc.queue);
  const storage = safe(svc.storage);
  const monitoring = safe(svc.monitoring);
  const secrets = safe(svc.secrets);
  const waf = safe(svc.waf);

  const lines = [
    'graph TD',

    '  User["Users / Clients"] --> DNS["Azure DNS / Traffic Manager"]',
    '  DNS --> FD["Azure Front Door"]',
    `  FD --> WAF["${waf}"]`,
    '  WAF --> APPGW["Application Gateway"]',

    '  subgraph AZ_EDGE["Azure Edge Layer"]',
    '    DNS',
    '    FD',
    '    WAF',
    '  end',

    '  subgraph AZ_NETWORK["Azure VNet / Network Layer"]',
    '    APPGW',
    '    FW["Azure Firewall / NSG"]',
    '    PE["Private Endpoints"]',
    '  end',

    '  subgraph AZ_COMPUTE["Azure Compute Layer"]',
    `    Compute["${compute}"]`,
    '    Pods["Application Pods / Containers / VMs"]',
    '    Workers["Background Workers"]',
    '  end',

    '  subgraph AZ_DATA["Azure Data Layer"]',
    `    DB["${database}"]`,
    `    Redis["${cache}"]`,
    `    Queue["${queue}"]`,
    `    Blob["${storage}"]`,
    '  end',

    '  subgraph AZ_SECURITY["Azure Security / Identity"]',
    '    Entra["Microsoft Entra ID"]',
    `    KeyVault["${secrets}"]`,
    '    Policy["Azure Policy"]',
    '  end',

    '  subgraph AZ_OBS["Azure Observability"]',
    `    Monitor["${monitoring}"]`,
    '    Logs["Log Analytics"]',
    '    Insights["Application Insights"]',
    '  end',

    '  APPGW --> Compute',
    '  Compute --> Pods',
    '  Pods --> DB',
    '  Pods --> Redis',
    '  Pods --> Queue',
    '  Pods --> Blob',
    '  Queue --> Workers',
    '  Pods --> Entra',
    '  Pods --> KeyVault',
    '  Pods --> Monitor',
    '  Monitor --> Logs',
    '  Monitor --> Insights',

    styleBlock()
  ];

  return finish(lines, 'azure', 'Azure provider-style generated architecture diagram');
}

function buildGcpDiagram(input, svc) {
  const compute = safe(svc.compute);
  const database = safe(svc.database);
  const cache = safe(svc.cache);
  const queue = safe(svc.queue);
  const storage = safe(svc.storage);
  const monitoring = safe(svc.monitoring);
  const secrets = safe(svc.secrets);
  const waf = safe(svc.waf);

  const lines = [
    'graph TD',

    '  User["Users / Clients"] --> DNS["Cloud DNS"]',
    '  DNS --> CDN["Cloud CDN"]',
    `  CDN --> Armor["${waf}"]`,
    '  Armor --> GLB["Cloud Load Balancing"]',

    '  subgraph GCP_EDGE["Google Cloud Edge Layer"]',
    '    DNS',
    '    CDN',
    '    Armor',
    '  end',

    '  subgraph GCP_NETWORK["Google Cloud VPC / Network Layer"]',
    '    GLB',
    '    NAT["Cloud NAT"]',
    '    FW["VPC Firewall Rules"]',
    '  end',

    '  subgraph GCP_COMPUTE["Google Cloud Compute Layer"]',
    `    Compute["${compute}"]`,
    '    Pods["Application Pods / Services"]',
    '    Workers["Background Workers"]',
    '  end',

    '  subgraph GCP_DATA["Google Cloud Data Layer"]',
    `    DB["${database}"]`,
    `    Redis["${cache}"]`,
    `    Queue["${queue}"]`,
    `    Storage["${storage}"]`,
    '  end',

    '  subgraph GCP_SECURITY["Google Cloud Security / IAM"]',
    '    IAM["Cloud IAM"]',
    `    SecretManager["${secrets}"]`,
    '    KMS["Cloud KMS"]',
    '  end',

    '  subgraph GCP_OBS["Google Cloud Observability"]',
    `    Monitor["${monitoring}"]`,
    '    Logs["Cloud Logging"]',
    '    Trace["Cloud Trace"]',
    '  end',

    '  GLB --> Compute',
    '  Compute --> Pods',
    '  Pods --> DB',
    '  Pods --> Redis',
    '  Pods --> Queue',
    '  Pods --> Storage',
    '  Queue --> Workers',
    '  Pods --> IAM',
    '  Pods --> SecretManager',
    '  SecretManager --> KMS',
    '  Pods --> Monitor',
    '  Monitor --> Logs',
    '  Monitor --> Trace',

    styleBlock()
  ];

  return finish(lines, 'gcp', 'GCP provider-style generated architecture diagram');
}

function buildOnPremDiagram(input, svc) {
  const compute = safe(svc.compute);
  const database = safe(svc.database);
  const cache = safe(svc.cache);
  const queue = safe(svc.queue);
  const storage = safe(svc.storage);
  const monitoring = safe(svc.monitoring);
  const secrets = safe(svc.secrets);
  const waf = safe(svc.waf);

  const lines = [
    'graph TD',

    '  User["Users / Clients"] --> DNS["Cloudflare / Public DNS"]',
    `  DNS --> WAF["${waf}"]`,
    '  WAF --> LB["HAProxy / NGINX / MetalLB"]',

    '  subgraph EDGE["Edge / DMZ Layer"]',
    '    DNS',
    '    WAF',
    '    LB',
    '  end',

    '  subgraph DC_NETWORK["Datacenter Network"]',
    '    FW["Firewall / VLAN Segmentation"]',
    '    Ingress["NGINX Ingress / Reverse Proxy"]',
    '  end',

    '  subgraph DC_COMPUTE["Compute Layer"]',
    `    Compute["${compute}"]`,
    '    Apps["Application Services"]',
    '    Workers["Background Workers"]',
    '  end',

    '  subgraph DC_DATA["Data Layer"]',
    `    DB["${database}"]`,
    `    Redis["${cache}"]`,
    `    Queue["${queue}"]`,
    `    Storage["${storage}"]`,
    '  end',

    '  subgraph DC_SECURITY["Security Layer"]',
    '    Keycloak["Keycloak Identity"]',
    `    Vault["${secrets}"]`,
    '    Backup["Backup Repository"]',
    '  end',

    '  subgraph DC_OBS["Observability"]',
    `    Monitor["${monitoring}"]`,
    '    Logs["Loki / Syslog"]',
    '    Metrics["Prometheus Metrics"]',
    '  end',

    '  LB --> FW',
    '  FW --> Ingress',
    '  Ingress --> Compute',
    '  Compute --> Apps',
    '  Apps --> DB',
    '  Apps --> Redis',
    '  Apps --> Queue',
    '  Apps --> Storage',
    '  Queue --> Workers',
    '  Apps --> Keycloak',
    '  Apps --> Vault',
    '  DB --> Backup',
    '  Apps --> Monitor',
    '  Monitor --> Logs',
    '  Monitor --> Metrics',

    styleBlock()
  ];

  return finish(lines, 'onprem', 'On-premise provider-style generated architecture diagram');
}

function buildHybridDiagram(input, svc) {
  const lines = [
    'graph TD',

    '  User["Users / Clients"] --> Edge["Cloudflare / Global DNS / WAF"]',
    '  Edge --> CloudLB["Cloud Load Balancer / Front Door / CloudFront"]',

    '  subgraph CLOUD["Cloud Application Zone"]',
    '    CloudLB --> CloudCompute["Managed Kubernetes / Containers"]',
    '    CloudCompute --> CloudCache["Managed Redis Cache"]',
    '    CloudCompute --> CloudQueue["Managed Queue / Event Bus"]',
    '    CloudCompute --> CloudObs["Cloud Monitoring"]',
    '  end',

    '  subgraph CONNECTIVITY["Private Connectivity"]',
    '    VPN["VPN / ExpressRoute / Direct Connect / Interconnect"]',
    '  end',

    '  subgraph ONPREM["On-premise Datacenter"]',
    '    OnPremLB["HAProxy / NGINX"]',
    '    OnPremDB["PostgreSQL HA / Oracle / SQL Server"]',
    '    OnPremStorage["MinIO / Ceph / SAN / NAS"]',
    '    Vault["Vault / Keycloak"]',
    '  end',

    '  CloudCompute --> VPN',
    '  VPN --> OnPremLB',
    '  OnPremLB --> OnPremDB',
    '  OnPremLB --> OnPremStorage',
    '  OnPremLB --> Vault',

    styleBlock()
  ];

  return finish(lines, 'hybrid', 'Hybrid cloud generated architecture diagram');
}

function buildMultiCloudDiagram(input, svc) {
  const lines = [
    'graph TD',

    '  User["Users / Clients"] --> Edge["Cloudflare Global DNS / WAF / CDN"]',

    '  subgraph AWS["AWS Primary Region"]',
    '    Edge --> AWSLB["CloudFront / ALB"]',
    '    AWSLB --> AWSEKS["EKS / ECS Primary App"]',
    '    AWSEKS --> AWSDB["Aurora / RDS Primary"]',
    '    AWSEKS --> AWSS3["S3 Object Storage"]',
    '  end',

    '  subgraph AZURE["Azure DR Region"]',
    '    Edge --> AzureFD["Azure Front Door"]',
    '    AzureFD --> AzureAKS["AKS DR App"]',
    '    AzureAKS --> AzureDB["Azure PostgreSQL Replica"]',
    '    AzureAKS --> Blob["Blob Storage"]',
    '  end',

    '  subgraph GCP["GCP Analytics / Data Services"]',
    '    GKE["GKE / Cloud Run Analytics"]',
    '    BQ["BigQuery / Data Lake"]',
    '    PubSub["Pub/Sub"]',
    '  end',

    '  AWSDB --> AzureDB',
    '  AWSS3 --> Blob',
    '  AWSEKS --> PubSub',
    '  PubSub --> GKE',
    '  GKE --> BQ',

    '  subgraph OBS["Cross-cloud Observability"]',
    '    OTel["OpenTelemetry"]',
    '    SIEM["Central SIEM"]',
    '  end',

    '  AWSEKS --> OTel',
    '  AzureAKS --> OTel',
    '  GKE --> OTel',
    '  OTel --> SIEM',

    styleBlock()
  ];

  return finish(lines, 'multicloud', 'Multi-cloud generated architecture diagram');
}

function styleBlock() {
  return [
    '  classDef edge fill:#102a43,stroke:#5b8dee,color:#e8eaf0',
    '  classDef compute fill:#0f2d20,stroke:#36c98e,color:#e8eaf0',
    '  classDef data fill:#2d1a2d,stroke:#c080e0,color:#e8eaf0',
    '  classDef security fill:#2d1a1a,stroke:#e05555,color:#e8eaf0',
    '  classDef obs fill:#2d2a0f,stroke:#e8c030,color:#e8eaf0'
  ].join('\n');
}

function finish(lines, diagramType, providerStyle) {
  return {
    mermaid: lines.join('\n'),
    providerStyle,
    diagramType,
    nodes: [],
    edges: []
  };
}

module.exports = { buildDiagram };