# Deploying to Google Cloud Platform (GCP)

Google Cloud Run is an excellent, fully-managed serverless platform for deploying containerized applications like the Starlight Tech Radar. It automatically scales up and down from zero, meaning you only pay for what you use.

We recommend using **Terraform** to provision your GCP infrastructure using Infrastructure as Code (IaC) best practices.

## Prerequisites

- A Google Cloud Project.
- [Terraform](https://www.terraform.io/) installed.
- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
- Docker image pushed to Google Artifact Registry.

## Terraform Configuration

Create a file named `main.tf` in your infrastructure repository or a `terraform/` directory.

### `main.tf`

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy to"
  type        = string
  default     = "us-central1"
}

variable "image_name" {
  description = "The container image URL (e.g., us-central1-docker.pkg.dev/my-project/my-repo/starlight-tech-radar:latest)"
  type        = string
}

variable "github_token" {
  description = "GitHub API Token"
  type        = string
  sensitive   = true
}

# Create a Secret in Google Secret Manager
resource "google_secret_manager_secret" "github_token" {
  secret_id = "starlight-github-token"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "github_token_version" {
  secret      = google_secret_manager_secret.github_token.id
  secret_data = var.github_token
}

# Deploy to Cloud Run
resource "google_cloud_run_v2_service" "starlight_radar" {
  name     = "starlight-tech-radar"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = var.image_name
      
      ports {
        container_port = 3000
      }

      env {
        name = "GITHUB_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.github_token.secret_id
            version = "latest"
          }
        }
      }
    }
  }
}

# Make the service publicly accessible
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.starlight_radar.location
  project  = google_cloud_run_v2_service.starlight_radar.project
  service  = google_cloud_run_v2_service.starlight_radar.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_v2_service.starlight_radar.uri
}
```

## Deployment Steps

1. **Initialize Terraform:**

   ```bash
   terraform init
   ```

2. **Review the Plan:**

   ```bash
   terraform plan -var="project_id=YOUR_PROJECT_ID" -var="image_name=YOUR_IMAGE_URL"
   ```

   *(Note: Terraform will prompt you for the `github_token` since it is marked as sensitive, or you can provide it via a `terraform.tfvars` file).*
3. **Apply the Configuration:**

   ```bash
   terraform apply
   ```

Once complete, Terraform will output the `service_url` where your Tech Radar is hosted!
