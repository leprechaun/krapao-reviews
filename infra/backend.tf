terraform {
  backend "s3" {
    region = "ap-southeast-1"
    bucket = "lmacguire-terraform"
    key    = "terraform.tfstate"

    workspace_key_prefix = "krapao-reviews"
  }
}
