project_name = "krapao-reviews"
aws_region   = "ap-southeast-1"
github_repo  = "leprechaun/krapao-reviews"

# Custom domains per workspace — leave empty to use the default *.cloudfront.net domain.
domain_names = {
  dev    = ["dev.krapao.fscker.org"]
  prod = ["prod.krapao.com", "www.prod.krapao.com"]
}

# acm_certificate_arns — sensitive, do not commit.
# Pass via TF_VAR_acm_certificate_arns env var or a gitignored secrets.tfvars:
#   export TF_VAR_acm_certificate_arns='{"production":"arn:aws:acm:us-east-1:...","staging":"arn:aws:acm:us-east-1:..."}'
