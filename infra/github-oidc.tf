data "aws_caller_identity" "current" {}

# ── GitHub OIDC provider ───────────────────────────────────────────────────────

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  # AWS validates GitHub's OIDC provider via root CA; thumbprints below are
  # required by the resource schema but are not used for actual verification.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

# ── IAM role trusted by GitHub Actions (main branch only) ─────────────────────

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.project_name}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

# ── Permissions ────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "github_actions" {
  # Terraform state bucket
  statement {
    sid    = "TerraformState"
    effect = "Allow"
    actions = [
      "s3:GetObject", "s3:PutObject", "s3:DeleteObject",
      "s3:ListBucket", "s3:GetBucketVersioning",
    ]
    resources = [
      "arn:aws:s3:::krapao-terraform-state",
      "arn:aws:s3:::krapao-terraform-state/*",
    ]
  }

  # Site S3 buckets (all workspaces match krapao-reviews-*)
  statement {
    sid    = "SiteBuckets"
    effect = "Allow"
    actions = [
      "s3:CreateBucket", "s3:DeleteBucket",
      "s3:GetBucketPolicy", "s3:PutBucketPolicy", "s3:DeleteBucketPolicy",
      "s3:GetBucketPublicAccessBlock", "s3:PutBucketPublicAccessBlock",
      "s3:GetBucketVersioning", "s3:PutBucketVersioning",
      "s3:GetBucketTagging", "s3:PutBucketTagging",
      "s3:GetObject", "s3:PutObject", "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      "arn:aws:s3:::${var.project_name}-*",
      "arn:aws:s3:::${var.project_name}-*/*",
    ]
  }

  # CloudFront — distributions, OAC, cache policies
  statement {
    sid       = "CloudFront"
    effect    = "Allow"
    actions   = ["cloudfront:*"]
    resources = ["*"]
  }

  # IAM — manage the OIDC provider and this role itself
  statement {
    sid    = "IAMOidc"
    effect = "Allow"
    actions = [
      "iam:CreateOpenIDConnectProvider", "iam:GetOpenIDConnectProvider",
      "iam:UpdateOpenIDConnectProvider", "iam:DeleteOpenIDConnectProvider",
      "iam:TagOpenIDConnectProvider",
    ]
    resources = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"]
  }

  statement {
    sid    = "IAMRole"
    effect = "Allow"
    actions = [
      "iam:CreateRole", "iam:GetRole", "iam:DeleteRole", "iam:TagRole",
      "iam:PutRolePolicy", "iam:GetRolePolicy", "iam:DeleteRolePolicy",
      "iam:ListRolePolicies", "iam:ListAttachedRolePolicies",
      "iam:ListInstanceProfilesForRole",
    ]
    resources = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-*"]
  }
}

resource "aws_iam_role_policy" "github_actions" {
  name   = "deploy"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions.json
}
