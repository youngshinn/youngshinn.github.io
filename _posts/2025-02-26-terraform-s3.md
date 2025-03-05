---
layout: single
title:  "Terraform을 이용한 S3 및 CloudFront 배포"
categories: Terraform
tag: [Terraform, Aws]
search: true
---

## **Terraform을 이용한 S3 및 CloudFront 배포**

## **1. Terraform 설정 시작하기**
먼저,`terraform 블록`을 통해 필요한 `프로바이더`와 `버전`을 정의합니다.

```bash
terraform {
  required_version = ">=1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.26.0"
    }
  }
}

provider "aws" {
  region = "us-west-2" # AWS 리전을 설정합니다.
}
```
- `required_version` : Terraform의 최소 버전을 지정합니다.
- `aws` : AWS 프로바이더를 사용하며, 특정 버전을 명시적으로 지정합니다

## **2. S3 버킷 생성 및 설정**

### **2.1 S3 버킷 생성**
S3 버킷을 생성하고 `force_destroy`를 통해 삭제 시 모든 데이터를 함께 삭제하도록 설정합니다.

```bash
resource "aws_s3_bucket" "demo_bucket" {
  bucket_prefix = "demo-bucket"
  force_destroy = true
}
```

### **2.2 퍼블릭 접근 차단**
S3 버킷의 퍼블릭 접근을 완전히 차단하여 보안을 강화합니다.

```bash
resource "aws_s3_bucket_public_access_block" "block_access_public" {
  bucket = aws_s3_bucket.demo_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

### **2.3 S3 객체 업로드**
`index.html` 파일을 S3 버킷에 업로드하여 CloudFront를 통해 제공할 콘텐츠를 설정합니다.

```bash
resource "aws_s3_object" "demo_object" {
    bucket = aws_s3_bucket.demo_bucket.id
    key = "index.html"
    content = "Hello world!"
    content_type = "text/html"
}
```

## **3. CloudFront 설정**

### **3.1 Origin Access Control(OAC) 생성**
OAC를 통해 CloudFront가 S3에 안전하게 접근할 수 있도록 설정합니다.
```bash
resource "aws_cloudfront_origin_access_control" "demo_oac" {
  name                              = "demo-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
```

### **3.2 CloudFront 배포 구성**
CloudFront를 통해 S3의 정적 파일을 캐시하고 HTTPS를 통해 안전하게 제공하도록 설정합니다.

```bash
resource "aws_cloudfront_distribution" "demo_cf" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    origin_id                = aws_s3_bucket.demo_bucket.id
    domain_name              = aws_s3_bucket.demo_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.demo_oac.id
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    cache_policy_id  = data.aws_cloudfront_cache_policy.demo_cache_policy.id
    target_origin_id = aws_s3_bucket.demo_bucket.id

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```
- `redirect-to-https`: HTTP 요청을 HTTPS로 리다이렉션하여 보안을 강화합니다.
- `cloudfront_default_certificate`: 기본 CloudFront SSL 인증서를 사용합니다.

## **4. S3 버킷 정책 설정**
S3 버킷에 정책을 적용하여 CloudFront에서만 접근할 수 있도록 제어합니다.

```bash
data "aws_iam_policy_document" "demo_policy_document" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.demo_bucket.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [aws_cloudfront_distribution.demo_cf.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.demo_bucket.id
  policy = data.aws_iam_policy_document.demo_policy_document.json
}
```

- `aws:SourceArn`: CloudFront 배포에서만 S3에 접근할 수 있도록 조건을 추가합니다.
- `s3:GetObject`: CloudFront에서 S3 객체를 읽을 수 있도록 허용합니다.

## **5. 캐시 정책 설정**
CloudFront의 캐시 정책을 사용하여 콘텐츠 캐싱을 최적화합니다.
```bash
data "aws_cloudfront_cache_policy" "demo_cache_policy" {
  name = "Managed-CachingOptimized"
}
```