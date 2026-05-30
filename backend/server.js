const express = require('express');
const cors = require('cors');

const { VERSION } = require('./utils/constants');
const { normalizeInput } = require('./utils/normalizeInput');

const { calculateSizing } = require('./engines/sizingEngine');
const { recommendDeployment } = require('./engines/deploymentEngine');
const { scoreProviders } = require('./engines/scoringEngine');
const { estimateCost } = require('./engines/pricingEngine');
const { buildDiagram } = require('./engines/diagramEngine');
const { securityDesign } = require('./engines/securityEngine');
const { drPlan } = require('./engines/drEngine');
const { recommendations } = require('./engines/recommendationEngine');
const { getReferences } = require('./engines/referenceEngine');

const { generateKubernetes } = require('./generators/kubernetesGenerator');
const { generateDockerCompose } = require('./generators/dockerComposeGenerator');
const { generateTerraform } = require('./generators/terraformGenerator');
const { generateHelm } = require('./generators/helmGenerator');
const { generateGithubActions } = require('./generators/cicdGenerator');

const providers = {
  AWS: require('./providers/awsProvider'),
  Azure: require('./providers/azureProvider'),
  GCP: require('./providers/gcpProvider'),
  'On-premise / Local': require('./providers/onpremProvider'),
  Hybrid: require('./providers/hybridProvider'),
  'Multi-cloud': require('./providers/multicloudProvider')
};

const app = express();

app.use(cors());
app.use(express.json());

function resolveSelectedCloud(input, scoring) {
  if (!input.cloud || input.cloud === 'Best fit (auto)') {
    return scoring.selected || 'AWS';
  }

  return input.cloud;
}

function normalizeProviderKey(selectedCloud) {
  if (selectedCloud === 'Hybrid') return 'Hybrid';
  if (selectedCloud === 'Multi-cloud') return 'Multi-cloud';
  if (selectedCloud === 'On-premise / Local') return 'On-premise / Local';
  if (selectedCloud === 'Azure') return 'Azure';
  if (selectedCloud === 'GCP') return 'GCP';

  return 'AWS';
}

function getProviderModule(providerKey) {
  const providerModule = providers[providerKey];

  if (!providerModule || typeof providerModule.serviceMap !== 'function') {
    throw new Error(`Provider module not found or invalid for provider: ${providerKey}`);
  }

  return providerModule;
}

function computeArchitectureV3(raw) {
  const input = normalizeInput(raw);

  const deployment = recommendDeployment(input);
  const scoring = scoreProviders(input);

  const selectedCloud = resolveSelectedCloud(input, scoring);
  const providerKey = normalizeProviderKey(selectedCloud);

  const providerModule = getProviderModule(providerKey);

  const size = calculateSizing(input, providerKey, deployment);
  const svc = providerModule.serviceMap(input, deployment);

  const cost = estimateCost(input, providerKey, deployment, size);

  /*
   * Important for v3.3:
   * buildDiagram receives deployment and size.
   */
  const diagram = buildDiagram(input, providerKey, svc, deployment, size);

  const security = securityDesign(providerKey, svc, input);
  const dr = drPlan(input, svc);
  const refs = getReferences(providerKey, input.appType);

  const iac = {
    kubernetes: generateKubernetes(input, svc, size),
    dockerCompose: generateDockerCompose(input, svc, size),
    terraform: generateTerraform(providerKey, input, svc, size),
    helm: generateHelm(input, size),
    githubActions: generateGithubActions()
  };

  const recs = recommendations(input, providerKey, deployment, cost);

  const arch = {
    frontend:
      input.appTier === 'Static website'
        ? 'Static web app + CDN'
        : 'SPA/API frontend',

    backend:
      deployment.model === 'Serverless'
        ? 'Functions/API handlers'
        : input.architecture === 'microservices'
        ? 'Domain microservices'
        : 'REST API service',

    database: svc.database,
    cache: svc.cache,
    queue: svc.queue,
    cdn: svc.cdn,
    auth: svc.auth,

    multiZone:
      input.sla === '99.99%'
        ? 'Multi-region'
        : input.sla === '99.9%'
        ? 'Multi-AZ'
        : 'Single zone'
  };

  const cloud = {
    provider: svc.provider,

    service_compute: svc.compute,
    service_db: svc.database,
    service_cache: svc.cache,
    service_lb: svc.lb,
    service_storage: svc.storage,
    service_queue: svc.queue,
    service_cdn: svc.cdn,
    service_auth: svc.auth,
    service_secrets: svc.secrets,
    service_monitoring: svc.monitoring,
    service_waf: svc.waf,

    use_kubernetes: deployment.model === 'Kubernetes',
    multi_zone: ['99.9%', '99.99%'].includes(input.sla),
    multi_region: input.region === 'global' || input.sla === '99.99%',

    justification: `${providerKey} selected for ${input.appType}. Deployment model: ${deployment.model}. ${deployment.reason}`
  };

  const summary = {
    infra: deployment.model,
    ha: arch.multiZone,
    scaling: size.hpa_max > size.hpa_min ? 'HPA Autoscale' : 'Fixed replicas',
    queue: svc.queue,
    sla_tier: input.sla
  };

  return {
    version: VERSION,
    input,

    decision: {
      selectedCloud: providerKey,
      deploymentModel: deployment.model,
      architectureStyle: input.architecture,
      reasoning: [
        deployment.reason,
        ...(scoring.reasoning || [])
      ]
    },

    scores: scoring.scores || {},

    arch,
    cloud,
    deployment,

    sizing: size,
    cost,
    diagram,

    references: refs,
    security,
    dr,

    iac,

    recommendations: recs,
    summary,

    // backward compatibility
    k8s: iac.kubernetes
  };
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: VERSION
  });
});

app.post('/api/architecture', (req, res) => {
  try {
    const result = computeArchitectureV3(req.body);
    res.json(result);
  } catch (error) {
    console.error('Architecture generation failed:', error);

    res.status(500).json({
      error: error.message,
      version: VERSION
    });
  }
});

app.post('/api/architecture/v1', (req, res) => {
  try {
    const result = computeArchitectureV3(req.body);
    res.json(result);
  } catch (error) {
    console.error('Architecture generation failed:', error);

    res.status(500).json({
      error: error.message,
      version: VERSION
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Smart Architecture Advisor ${VERSION} running on :${PORT}`);
});

module.exports = {
  computeArchitectureV3
};