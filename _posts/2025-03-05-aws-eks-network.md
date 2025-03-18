---
layout: single
title:  "Terraform을 활용한 AWS EKS 구축하기(Network) "
categories: AWS-pratice
tag: [vpc, Aws, Eks, Terraform]
search: true
---

# Terraform을 활용한 EKS 구축하기 - Network

## **프로젝트 구조**
```plaintext
project_root/
├── network/                 # 네트워크 설정 (VPC, 서브넷)
│   ├── network.tf
│   ├── terraform.tfvars
│   ├── _data.tf
│   ├── _locals.tf
│   ├── _outputs.tf
│   ├── _provider.tf
│   ├── _variables.tf
└── README.md
```

## **Terraform 코드 설명**
### 1. 네트워크 설정 (`network.tf`)
AWS에서 EKS를 구축하기 위해 **VPC(Virtual Private Cloud)**와 **서브넷**을 생성합니다.
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  name    = "${local.name}-vpc"
  cidr    = "10.0.0.0/16"

  enable_dns_hostnames    = true  # VPC에서 DNS 호스트네임 활성화
  enable_dns_support      = true  # VPC에서 DNS 지원 활성화
  azs                     = ["ap-northeast-2a", "ap-northeast-2b", "ap-northeast-2c"]  # 가용 영역 설정
  private_subnets         = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]  # 사설 서브넷
  public_subnets          = ["10.0.1.0/24"]  # 공용 서브넷 (ALB 컨트롤러 실습용)
  map_public_ip_on_launch = true  # 공용 서브넷에서 인스턴스에 퍼블릭 IP 할당
  enable_nat_gateway      = true  # NAT 게이트웨이 활성화
  single_nat_gateway      = true  # 단일 NAT 게이트웨이 사용

  public_subnet_tags = {
    "subnet_type" = "public",
    "kubernetes.io/role/elb" = "1",  # 퍼블릭 서브넷에서 ELB를 실행할 수 있도록 설정
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }

  private_subnet_tags = {
    "subnet_type" = "private",
    "kubernetes.io/role/internal-elb" = "1",  # 사설 서브넷에서 내부 ELB 실행 가능하도록 설정
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }
}
```

### 2. 로컬 변수 설정 (`_locals.tf`)
프로젝트 및 EKS 클러스터에 대한 공통 변수 정의
```hcl
locals {
  ## 공통 설정
  name           = "${var.environment}-${var.project}"  # 환경과 프로젝트 이름을 조합하여 네이밍
  cluster_name   = "${var.environment}-${var.project}-cluster"  # 환경에 따라 EKS 클러스터 이름 설정
}
```

### 3. 프로바이더 설정 (`_provider.tf`)
Terraform이 AWS와 상호작용하도록 설정합니다.
```hcl
provider "aws" {
  region = var.aws_region  # AWS 리전 설정
  default_tags {
    tags = {
      Project     = var.project  # 프로젝트 태그
      Environment = var.environment  # 환경 태그 (dev, prod 등)
      ManagedBy   = "Terraform"  # Terraform을 통해 관리됨을 표시
    }    
  }
}

terraform {
  backend "s3" {
    bucket = "shineks-bucket"  # 상태 파일을 저장할 S3 버킷
    key    = "terraform/dev/network/terraform.tfstate"  # 상태 파일 경로
    region = "ap-northeast-2"  # S3 버킷이 위치한 리전
  }
}
```

### 4. 변수 설정 (`_variables.tf`)
Terraform에서 사용할 변수를 정의합니다.
```hcl
variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "project" {
  description = "프로젝트 이름"
  type        = string
  default     = "shin-eks"
}

variable "environment" {
  description = "환경 이름 (예: dev, prod)"
  type        = string
  default     = "dev"
}
```

### 5. Terraform 실행 방법
```sh
terraform init  # Terraform 초기화
terraform plan  # 실행 계획 확인
terraform apply -auto-approve  # Terraform 적용
```

### 추가 고려사항
- **Terraform 모듈화 가능**: VPC, 서브넷, 보안 그룹을 모듈화하여 재사용 가능
- **AWS 리소스 정리**: 필요하지 않은 리소스 삭제 시 `terraform destroy` 사용

