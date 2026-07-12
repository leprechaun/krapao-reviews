locals {
  env    = terraform.workspace
  prefix = "${var.project_name}-${local.env}"

  price_class = local.env == "prod" ? "PriceClass_All" : "PriceClass_100"

  tags = {
    Project     = var.project_name
    Environment = local.env
    ManagedBy   = "terraform"
  }
}
