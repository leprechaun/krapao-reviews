locals {
  env    = terraform.workspace
  prefix = "${var.project_name}-${local.env}"

  domain_name       = lookup(var.domain_names, local.env, "")
  use_custom_domain = local.domain_name != ""

  price_class = local.env == "prod" ? "PriceClass_All" : "PriceClass_100"

  tags = {
    Project     = var.project_name
    Environment = local.env
    ManagedBy   = "terraform"
  }
}
