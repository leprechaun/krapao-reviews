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
  description = "Per-workspace list of custom domain aliases for the CloudFront distribution. Leave empty to use the default *.cloudfront.net domain."
  type        = map(list(string))
  default     = {}
  # Example:
  # {
  #   staging    = ["staging.krapao.com"]
  #   production = ["krapao.com", "www.krapao.com"]
  # }
}

variable "acm_certificate_arns" {
  description = "Per-workspace ACM certificate ARN (must be in us-east-1) for HTTPS on custom domains. Required when domain_names is set for that workspace."
  type        = map(string)
  sensitive   = true
  default     = {}
  # Pass via TF_VAR_acm_certificate_arns or a gitignored secrets.tfvars
}

variable "github_repo" {
  description = "GitHub repository in owner/name format, used to scope the OIDC trust policy."
  type        = string
  # e.g. "leprechaun/krapao-reviews"
}
