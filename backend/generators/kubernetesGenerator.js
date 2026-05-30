function generateKubernetes(input, svc, sizing){ const name=(input.appType||'app').toLowerCase().replace(/[^a-z0-9]/g,'-'); return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}-backend
  labels:
    app.kubernetes.io/name: ${name}
    app.kubernetes.io/version: "3.0-enterprise"
spec:
  replicas: ${sizing.backend_pods}
  selector:
    matchLabels: { app: ${name}-backend }
  template:
    metadata:
      labels: { app: ${name}-backend }
    spec:
      containers:
      - name: backend
        image: yourdockerhub/${name}-backend:v3.0
        ports: [{ containerPort: 3000 }]
`; }
module.exports={generateKubernetes};
