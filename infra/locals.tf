locals {
  env    = terraform.workspace
  prefix = "${var.project_name}-${local.env}"

  domain_names        = lookup(var.domain_names, local.env, [])
  acm_certificate_arn = lookup(var.acm_certificate_arns, local.env, "")
  use_custom_domain   = length(local.domain_names) > 0 && local.acm_certificate_arn != ""

  price_class = local.env == "prod" ? "PriceClass_All" : "PriceClass_100"

  tags = {
    Project     = var.project_name
    Environment = local.env
    ManagedBy   = "terraform"
  }
}
