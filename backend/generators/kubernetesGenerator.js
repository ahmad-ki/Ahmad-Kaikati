function generateKubernetes(input = {}, svc = {}, sizing = {}) {
  const name = (input.appType || 'smart-advisor-app')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  const backendReplicas = sizing.backend_pods || 2;
  const frontendReplicas = sizing.frontend_pods || 1;
  const hpaMin = sizing.hpa_min || backendReplicas;
  const hpaMax = sizing.hpa_max || backendReplicas * 3;

  return `# Smart Architecture Advisor generated Kubernetes YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}-frontend
  labels:
    app: ${name}-frontend
    app.kubernetes.io/version: "3.3-enterprise"
spec:
  replicas: ${frontendReplicas}
  selector:
    matchLabels:
      app: ${name}-frontend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: ${name}-frontend
    spec:
      containers:
      - name: frontend
        image: yourdockerhub/${name}-frontend:v3.3
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "200m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}-backend
  labels:
    app: ${name}-backend
    app.kubernetes.io/version: "3.3-enterprise"
spec:
  replicas: ${backendReplicas}
  selector:
    matchLabels:
      app: ${name}-backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: ${name}-backend
    spec:
      containers:
      - name: backend
        image: yourdockerhub/${name}-backend:v3.3
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            cpu: "${sizing.cpu_per_pod || '500m'}"
            memory: "${sizing.memory_per_pod || '512Mi'}"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: ${name}-frontend-svc
spec:
  selector:
    app: ${name}-frontend
  ports:
  - port: 80
    targetPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: ${name}-backend-svc
spec:
  selector:
    app: ${name}-backend
  ports:
  - port: 3000
    targetPort: 3000

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${name}-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${name}-backend
  minReplicas: ${hpaMin}
  maxReplicas: ${hpaMax}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
`;
}

module.exports = {
  generateKubernetes
};