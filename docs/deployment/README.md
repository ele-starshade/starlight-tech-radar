# Deployment Overview

Starlight Tech Radar is a modern Vue 3 application built with Quasar Framework, utilizing Server-Side Rendering (SSR) for optimal performance, SEO, and accessibility. 

Because it's an SSR application, it requires a Node.js runtime environment to serve the application. (If you prefer a statically generated site (SSG) or SPA, you can modify the build command in `package.json`, but SSR is the recommended and default approach).

We have provided guides for deploying the Starlight Tech Radar to several popular platforms using modern Infrastructure as Code (IaC) and deployment practices:

- [Kubernetes (K8s)](kubernetes.md) - Deploying via standard manifests or Helm charts.
- [Google Cloud Platform (GCP)](gcp.md) - Deploying to Cloud Run using Terraform.
- [Amazon Web Services (AWS)](aws.md) - Deploying to AWS App Runner / ECS using AWS CDK.
- [Netlify](netlify.md) - Deploying using Netlify Edge Functions.

## Preparing for Deployment

Regardless of your target platform, you will typically need to build the production assets.

### 1. Environment Variables
Ensure you have your production environment variables ready (e.g., `GITHUB_TOKEN`, `SLACK_WEBHOOK`).

### 2. Building the Docker Image
For container-based deployments (K8s, GCP, AWS), the project includes a `Dockerfile`.

To build the image locally:
```bash
docker build -t starlight-tech-radar:latest .
```

To run the image locally for testing:
```bash
docker run -p 3000:3000 -e GITHUB_TOKEN=your_token starlight-tech-radar:latest
```
