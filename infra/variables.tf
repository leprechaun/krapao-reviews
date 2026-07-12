variable "project_name" {
  description = "Base name used for all resources"
  type        = string
  default     = "krapao-reviews"
}

variable "aws_region" {
  description = "AWS region for S3 and supporting resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "domain_names" {
  description = "Primary domain per workspace."
  type        = map(string)
  default     = {}
  # { dev = "dev.krapao.fscker.org", prod = "prod.krapao.com" }
}

variable "hosted_zone_names" {
  description = "Route 53 hosted zone name per workspace, used for cert validation and A records."
  type        = map(string)
  default     = {}
  # { dev = "fscker.org", prod = "krapao.com" }
}

variable "github_repo" {
  description = "GitHub repository in owner/name format, used to scope the OIDC trust policy."
  type        = string
  # e.g. "leprechaun/krapao-reviews"
}
