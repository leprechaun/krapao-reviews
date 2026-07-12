terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

# CloudFront requires ACM certificates to be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

# ── S3 bucket ──────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "site" {
  bucket = local.prefix
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.s3_cloudfront.json

  depends_on = [aws_s3_bucket_public_access_block.site]
}

data "aws_iam_policy_document" "s3_cloudfront" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

# ── ACM certificate + DNS validation ──────────────────────────────────────────

data "aws_route53_zone" "site" {
  count        = local.use_custom_domain ? 1 : 0
  name         = var.hosted_zone_names[local.env]
  private_zone = false
}

resource "aws_acm_certificate" "site" {
  count             = local.use_custom_domain ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = local.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = local.use_custom_domain ? {
    for dvo in aws_acm_certificate.site[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.site[0].zone_id
}

resource "aws_acm_certificate_validation" "site" {
  count                   = local.use_custom_domain ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ── Route 53 alias → CloudFront ───────────────────────────────────────────────

resource "aws_route53_record" "site" {
  count   = local.use_custom_domain ? 1 : 0
  zone_id = data.aws_route53_zone.site[0].zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

# ── CloudFront OAC ─────────────────────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = local.prefix
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── Cache policies ─────────────────────────────────────────────────────────────

resource "aws_cloudfront_cache_policy" "immutable" {
  name        = "${local.prefix}-immutable"
  comment     = "1-year cache for content-hashed assets"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "short" {
  name        = "${local.prefix}-short"
  comment     = "1-hour cache for locale files"
  default_ttl = 3600
  max_ttl     = 3600
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# ── CloudFront distribution ────────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = local.price_class
  aliases             = local.use_custom_domain ? [local.domain_name] : []

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${local.prefix}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # /assets/* — immutable, content-hashed
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-${local.prefix}"
    cache_policy_id        = aws_cloudfront_cache_policy.immutable.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # /locales/* — short TTL for i18n files
  ordered_cache_behavior {
    path_pattern           = "/locales/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-${local.prefix}"
    cache_policy_id        = aws_cloudfront_cache_policy.short.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Default — index.html, no cache
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-${local.prefix}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Managed no-cache policy (AWS managed)
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }

  # SPA routing — S3 returns 403 for missing paths (OAC + private bucket)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  dynamic "viewer_certificate" {
    for_each = local.use_custom_domain ? [1] : []
    content {
      acm_certificate_arn      = aws_acm_certificate_validation.site[0].certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }

  dynamic "viewer_certificate" {
    for_each = local.use_custom_domain ? [] : [1]
    content {
      cloudfront_default_certificate = true
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  depends_on = [aws_acm_certificate_validation.site]
}
