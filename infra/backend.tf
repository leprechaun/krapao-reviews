terraform {
  backend "s3" {
    region = "ap-southeast-1"
    bucket = "lmacguire-terraform"
    key = "krapao-reviews"
  }
}
