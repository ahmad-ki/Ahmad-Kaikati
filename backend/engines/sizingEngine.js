const USER_LEVELS = ['100', '1K', '10K', '100K', '1M'];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getScaleIndex(users = '10K') {
  const index = USER_LEVELS.indexOf(users);
  return clamp(index === -1 ? 2 : index, 0, 4);
}

function getScaleTier(scale) {
  return ['small', 'small', 'medium', 'large', 'enterprise'][scale] || 'medium';
}

function normalizeProvider(provider = 'AWS') {
  if (provider === 'Hybrid' || provider === 'Multi-cloud') return 'AWS';
  return provider || 'AWS';
}

function getProviderSizingCatalog(provider = 'AWS') {
  const catalogs = {
    AWS: {
      small: {
        instance: 't3.medium',
        family: 'Burstable General Purpose',
        vcpu: 2,
        memory: '4 GiB',
        useCase: 'small web/API workloads'
      },
      medium: {
        instance: 'm6i.large',
        family: 'General Purpose compute-balanced',
        vcpu: 2,
        memory: '8 GiB',
        useCase: 'medium production workloads'
      },
      large: {
        instance: 'm6i.2xlarge',
        family: 'General Purpose compute-balanced',
        vcpu: 8,
        memory: '32 GiB',
        useCase: 'large HA workloads'
      },
      enterprise: {
        instance: 'm6i.4xlarge',
        family: 'Enterprise general purpose',
        vcpu: 16,
        memory: '64 GiB',
        useCase: 'enterprise high-scale workloads'
      }
    },

    Azure: {
      small: {
        instance: 'Standard_B4ms',
        family: 'Burstable B-series',
        vcpu: 4,
        memory: '16 GiB',
        useCase: 'small cost-optimized workloads'
      },
      medium: {
        instance: 'Standard_D4s_v5',
        family: 'General Purpose D-series',
        vcpu: 4,
        memory: '16 GiB',
        useCase: 'medium production workloads'
      },
      large: {
        instance: 'Standard_D8s_v5',
        family: 'General Purpose D-series',
        vcpu: 8,
        memory: '32 GiB',
        useCase: 'large production workloads'
      },
      enterprise: {
        instance: 'Standard_D16s_v5',
        family: 'Enterprise D-series',
        vcpu: 16,
        memory: '64 GiB',
        useCase: 'enterprise high-scale workloads'
      }
    },

    GCP: {
      small: {
        instance: 'e2-standard-2',
        family: 'Cost-optimized E2',
        vcpu: 2,
        memory: '8 GiB',
        useCase: 'small efficient workloads'
      },
      medium: {
        instance: 'n2-standard-4',
        family: 'Balanced N2',
        vcpu: 4,
        memory: '16 GiB',
        useCase: 'medium production workloads'
      },
      large: {
        instance: 'n2-standard-8',
        family: 'Balanced N2',
        vcpu: 8,
        memory: '32 GiB',
        useCase: 'large scalable workloads'
      },
      enterprise: {
        instance: 'n2-standard-16',
        family: 'Enterprise N2',
        vcpu: 16,
        memory: '64 GiB',
        useCase: 'enterprise global workloads'
      }
    },

    'On-premise / Local': {
      small: {
        instance: '4 vCPU / 8 GiB VM',
        family: 'Small virtualization node',
        vcpu: 4,
        memory: '8 GiB',
        useCase: 'small local VM or Docker host'
      },
      medium: {
        instance: '8 vCPU / 16 GiB VM',
        family: 'Medium virtualization node',
        vcpu: 8,
        memory: '16 GiB',
        useCase: 'medium local production workloads'
      },
      large: {
        instance: '16 vCPU / 64 GiB VM',
        family: 'Large virtualization node',
        vcpu: 16,
        memory: '64 GiB',
        useCase: 'large on-prem Kubernetes or DB workloads'
      },
      enterprise: {
        instance: '32 vCPU / 128 GiB VM',
        family: 'Enterprise virtualization node',
        vcpu: 32,
        memory: '128 GiB',
        useCase: 'enterprise local cluster node'
      }
    }
  };

  return catalogs[normalizeProvider(provider)] || catalogs.AWS;
}

function getStorageEstimate(scale, dataSize = 'medium') {
  const matrix = {
    small: [20, 40, 80, 200, 800],
    medium: [50, 100, 300, 1000, 5000],
    large: [200, 500, 1500, 8000, 30000]
  };

  return matrix[dataSize]?.[scale] || matrix.medium[scale] || 300;
}

function getBandwidthEstimate(scale, trafficPattern = 'constant') {
  const base = [50, 150, 800, 5000, 50000][scale] || 800;

  const multiplier =
    trafficPattern === 'burst'
      ? 2.2
      : trafficPattern === 'peak'
      ? 1.5
      : 1;

  return Math.round(base * multiplier);
}

function getBaseCapacity(scale) {
  return [
    {
      frontendPods: 1,
      backendPods: 1,
      nodes: 1,
      workers: 0,
      cpuPerPod: '250m',
      memoryPerPod: '256Mi'
    },
    {
      frontendPods: 1,
      backendPods: 2,
      nodes: 1,
      workers: 0,
      cpuPerPod: '250m',
      memoryPerPod: '256Mi'
    },
    {
      frontendPods: 2,
      backendPods: 3,
      nodes: 3,
      workers: 1,
      cpuPerPod: '500m',
      memoryPerPod: '512Mi'
    },
    {
      frontendPods: 3,
      backendPods: 5,
      nodes: 5,
      workers: 2,
      cpuPerPod: '500m',
      memoryPerPod: '512Mi'
    },
    {
      frontendPods: 5,
      backendPods: 10,
      nodes: 10,
      workers: 5,
      cpuPerPod: '1000m',
      memoryPerPod: '1Gi'
    }
  ][scale];
}

function normalizeDeploymentModel(model) {
  if (!model) return 'Auto-recommend';

  const value = String(model).toLowerCase();

  if (value.includes('vm')) return 'Traditional VMs';
  if (value.includes('docker') || value.includes('container')) return 'Docker Containers';
  if (value.includes('kubernetes') || value.includes('k8s')) return 'Kubernetes';
  if (value.includes('serverless') || value.includes('function')) return 'Serverless';

  return model;
}

function getSlaMultiplier(sla = '99%') {
  if (sla === '99.99%') return 2;
  if (sla === '99.9%') return 1.5;
  if (sla === '99%') return 1.15;
  return 1;
}

function getTrafficMultiplier(trafficPattern = 'constant') {
  if (trafficPattern === 'burst') return 2;
  if (trafficPattern === 'peak') return 1.5;
  return 1;
}

function calculateSizing(input = {}, selectedCloud = 'AWS', deployment = {}) {
  const users = input.users || '10K';
  const sla = input.sla || '99%';
  const trafficPattern = input.trafficPattern || 'constant';
  const dataSize = input.dataSize || 'medium';
  const architecture = input.architecture || 'monolith';
  const region = input.region || 'local';

  const deploymentModel = normalizeDeploymentModel(
    deployment.model || input.deploymentModel || 'Auto-recommend'
  );

  const scale = getScaleIndex(users);
  const scaleTier = getScaleTier(scale);
  const providerCatalog = getProviderSizingCatalog(selectedCloud);
  const recommended = providerCatalog[scaleTier] || providerCatalog.medium;
  const base = getBaseCapacity(scale);

  const slaMultiplier = getSlaMultiplier(sla);
  const trafficMultiplier = getTrafficMultiplier(trafficPattern);

  const isMicroservices = architecture === 'microservices';
  const isGlobal = region === 'global';

  let frontendPods = Math.ceil(base.frontendPods * slaMultiplier);
  let backendPods = Math.ceil(base.backendPods * slaMultiplier * trafficMultiplier);
  let workerPods = isMicroservices ? Math.max(base.workers, Math.ceil(backendPods / 2)) : 0;

  let nodeCount = Math.ceil(base.nodes * slaMultiplier * (isGlobal ? 2 : 1));
  let vmInstances = 0;
  let containerTasks = 0;

  if (deploymentModel === 'Traditional VMs') {
    frontendPods = 0;
    backendPods = 0;
    workerPods = 0;
    vmInstances = Math.max(1, Math.ceil(base.nodes * slaMultiplier * (isGlobal ? 2 : 1)));
    nodeCount = vmInstances;
  }

  if (deploymentModel === 'Docker Containers') {
    containerTasks = Math.max(2, backendPods + frontendPods + workerPods);
    nodeCount = Math.max(1, Math.ceil(containerTasks / 4));
  }

  if (deploymentModel === 'Serverless') {
    frontendPods = 0;
    backendPods = 0;
    workerPods = 0;
    containerTasks = 0;
    nodeCount = 0;
    vmInstances = 0;
  }

  const hpaMin =
    deploymentModel === 'Serverless'
      ? 0
      : backendPods || vmInstances || containerTasks || 1;

  const hpaMax =
    deploymentModel === 'Serverless'
      ? 0
      : Math.max(hpaMin, Math.ceil(hpaMin * (trafficPattern === 'burst' ? 5 : 3)));

  const storageGb = getStorageEstimate(scale, dataSize);
  const bandwidthGb = getBandwidthEstimate(scale, trafficPattern);

  const sizing = {
    scale_tier: scaleTier,

    compute_family: recommended.family,
    recommended_instance: recommended.instance,
    recommended_vcpu: recommended.vcpu,
    recommended_memory: recommended.memory,
    recommended_use_case: recommended.useCase,

    frontend_pods: frontendPods,
    backend_pods: backendPods,
    worker_pods: workerPods,

    node_count: nodeCount,
    vm_instances: vmInstances,
    container_tasks: containerTasks,

    cpu_per_pod: base.cpuPerPod,
    memory_per_pod: base.memoryPerPod,

    hpa_min: hpaMin,
    hpa_max: hpaMax,
    hpa_trigger: 'CPU > 70% OR Memory > 80%',

    storage_gb: storageGb,
    bandwidth_gb: bandwidthGb,

    ha_mode:
      sla === '99.99%'
        ? 'Multi-region active-active / active-passive'
        : sla === '99.9%'
        ? 'Multi-AZ / warm standby'
        : 'Single zone',

    scaling_mode:
      deploymentModel === 'Serverless'
        ? 'Managed serverless autoscaling'
        : hpaMax > hpaMin
        ? 'Horizontal autoscaling'
        : 'Fixed capacity',

    details: [
      `Scale tier is ${scaleTier} based on ${users} users.`,
      `Recommended compute is ${recommended.instance} (${recommended.family}).`,
      `Recommended CPU/RAM is ${recommended.vcpu} vCPU / ${recommended.memory}.`,
      `Deployment model is ${deploymentModel}.`,
      `SLA multiplier is ${slaMultiplier} for ${sla}.`,
      `Traffic multiplier is ${trafficMultiplier} for ${trafficPattern} traffic.`,
      `Estimated storage requirement is ${storageGb} GB.`,
      `Estimated bandwidth requirement is ${bandwidthGb} GB/month.`,
      deploymentModel === 'Kubernetes'
        ? `Kubernetes requires approximately ${nodeCount} node(s).`
        : deploymentModel === 'Traditional VMs'
        ? `VM deployment requires approximately ${vmInstances} VM instance(s).`
        : deploymentModel === 'Docker Containers'
        ? `Container deployment requires approximately ${containerTasks} container task(s).`
        : 'Serverless deployment uses managed scaling and does not require fixed nodes.'
    ]
  };

  // camelCase compatibility
  sizing.scaleTier = sizing.scale_tier;
  sizing.computeFamily = sizing.compute_family;
  sizing.recommendedInstance = sizing.recommended_instance;
  sizing.recommendedVcpu = sizing.recommended_vcpu;
  sizing.recommendedMemory = sizing.recommended_memory;
  sizing.recommendedUseCase = sizing.recommended_use_case;
  sizing.frontendPods = sizing.frontend_pods;
  sizing.backendPods = sizing.backend_pods;
  sizing.workerPods = sizing.worker_pods;
  sizing.nodeCount = sizing.node_count;
  sizing.vmInstances = sizing.vm_instances;
  sizing.containerTasks = sizing.container_tasks;
  sizing.cpuPerPod = sizing.cpu_per_pod;
  sizing.memoryPerPod = sizing.memory_per_pod;
  sizing.hpaMin = sizing.hpa_min;
  sizing.hpaMax = sizing.hpa_max;
  sizing.storageGb = sizing.storage_gb;
  sizing.bandwidthGb = sizing.bandwidth_gb;

  return sizing;
}

module.exports = {
  calculateSizing,
  getScaleIndex,
  getScaleTier,
  getProviderSizingCatalog,
  getStorageEstimate,
  getBandwidthEstimate
};