output "cloudfront_domain" {
  description = "CloudFront distribution domain name (always available)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — used for cache invalidation after deploy"
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket_name" {
  description = "S3 bucket name — used as the sync target"
  value       = aws_s3_bucket.site.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.site.arn
}

output "site_url" {
  description = "Primary URL for this environment"
  value       = local.use_custom_domain ? "https://${local.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions — set this as the AWS_ROLE_ARN Actions variable"
  value       = aws_iam_role.github_actions.arn
}
