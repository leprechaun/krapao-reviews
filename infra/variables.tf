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

variable "github_repo" {
  description = "GitHub repository in owner/name format, used to scope the OIDC trust policy."
  type        = string
  # e.g. "leprechaun/krapao-reviews"
}
