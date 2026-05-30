function generateHelm(input,sizing){ return `replicaCount: ${sizing.backend_pods}
image:
  repository: yourdockerhub/backend
  tag: v3.0
resources:
  requests:
    cpu: 500m
    memory: 512Mi
`; }
module.exports={generateHelm};
