# Deploying to Kubernetes

Deploying Starlight Tech Radar to Kubernetes (K8s) is a great choice for organizations that already have established container orchestration infrastructure.

## Prerequisites

- A running Kubernetes cluster.
- `kubectl` configured to communicate with your cluster.
- The Docker image published to a container registry (e.g., Docker Hub, GitHub Container Registry, AWS ECR, GCP GCR).

## Kubernetes Manifests

Below is a standard set of manifests to deploy the application. It includes a Deployment, a Service, and a HorizontalPodAutoscaler (HPA).

### `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: starlight-tech-radar
  labels:
    app: starlight-tech-radar
spec:
  replicas: 2
  selector:
    matchLabels:
      app: starlight-tech-radar
  template:
    metadata:
      labels:
        app: starlight-tech-radar
    spec:
      containers:
        - name: starlight-tech-radar
          image: your-registry.com/starlight-tech-radar:latest
          ports:
            - containerPort: 3000
          env:
            # It is highly recommended to use Kubernetes Secrets for these values
            - name: GITHUB_TOKEN
              valueFrom:
                secretKeyRef:
                  name: starlight-secrets
                  key: GITHUB_TOKEN
            - name: SLACK_WEBHOOK
              valueFrom:
                secretKeyRef:
                  name: starlight-secrets
                  key: SLACK_WEBHOOK
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: starlight-tech-radar-svc
spec:
  type: ClusterIP
  selector:
    app: starlight-tech-radar
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

### Applying the Manifests

1. Create the necessary secrets:

   ```bash
   kubectl create secret generic starlight-secrets 
     --from-literal=GITHUB_TOKEN='your_token' 
     --from-literal=SLACK_WEBHOOK='your_webhook'
   ```

2. Apply the deployment and service:

   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   ```

3. Expose the service via an Ingress controller (e.g., NGINX Ingress) depending on your cluster setup.
