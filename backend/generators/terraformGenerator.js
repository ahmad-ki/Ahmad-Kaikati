function generateTerraform(provider = 'AWS') {
  if (provider === 'Azure') {
    return `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "rg-smart-advisor-v33"
  location = "eastus"
}

# TODO:
# - Add AKS or Azure Container Apps
# - Add Azure Database for PostgreSQL
# - Add Azure Cache for Redis
# - Add Azure Front Door + WAF
# - Add Key Vault
# - Add Log Analytics / App Insights
`;
  }

  if (provider === 'GCP') {
    return `terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = "us-central1"
}

variable "project_id" {}

# TODO:
# - Add GKE or Cloud Run
# - Add Cloud SQL PostgreSQL
# - Add Memorystore Redis
# - Add Cloud CDN + Cloud Armor
# - Add Secret Manager
# - Add Cloud Monitoring
`;
  }

  if (provider === 'On-premise / Local') {
    return `# On-prem Terraform / IaC skeleton

# Option 1:
# - Use vSphere Terraform provider
# - Use Proxmox Terraform provider

# Option 2:
# - Use Ansible for OS configuration
# - Install Docker / k3s / kubeadm
# - Install PostgreSQL HA
# - Install Redis Sentinel
# - Install MinIO / Ceph
# - Install HAProxy / NGINX

# TODO:
# - Add VM definitions
# - Add network definitions
# - Add storage definitions
# - Add Ansible inventory
`;
  }

  return `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "smart-advisor-v33"
  cidr = "10.0.0.0/16"
}

# TODO:
# - Add EKS / ECS / EC2 Auto Scaling
# - Add RDS / Aurora PostgreSQL
# - Add ElastiCache Redis
# - Add S3 bucket
# - Add ALB
# - Add CloudFront
# - Add AWS WAF
# - Add Secrets Manager
# - Add CloudWatch
`;
}

module.exports = {
  generateTerraform
};