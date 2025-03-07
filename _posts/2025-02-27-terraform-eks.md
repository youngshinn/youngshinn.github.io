---
layout: single
title:  "Terraform을 이용한 eks cluster 배포"
categories: Terraform
tag: [Terraform, Aws, Eks]
search: true
---
## **Terraform을 이용한 eks cluster 배포**

## 사전 준비 ## 

- AWS 계정
- Terraform (v1.0 이상)
- AWS CLI (로그인 및 인증 설정 필요)
- kubectl (Kubernetes 클러스터 제어 도구)

## **1.Terraform 기본 설정**
Terraform은 인프라를 코드(Infrastructure as Code, IaC)로 관리할 수 있게 도와주는 도구입니다. 코드를 통해 클라우드 자원(AWS, Azure, GCP 등)을 자동으로 생성하고 관리할 수 있습니다.

```bash
terraform {
  required_version = ">=1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.26.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.24.0"
    }
  }
}
```
- `required_version` = ">=1.0": Terraform 버전 1.0 이상을 사용하도록 설정합니다.

- `required_providers`: AWS와 Kubernetes의 Provider를 사용합니다.

- `Provider`: Terraform이 특정 클라우드나 서비스와 통신할 수 있게 하는 플러그인입니다.

## **2. AWS, K8S Provider 설정**

### **2.1 AWS Provider 설정**

```bash
provider "aws" {
  region = "ap-northeast-2"
}
```
- `region`: AWS 리전(서버 위치)을 "ap-northeast-2" (서울 리전)으로 설정합니다.
- 리전 설정 시 가까운 지역을 선택하면 성능이 향상됩니다.

### **2.2 k8s 설정**

```bash
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority.data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}
```

- `host`: Kubernetes API 서버의 주소입니다.
- `cluster_ca_certificate`: 인증서 정보로 보안을 강화합니다.
- `exec` 설정을 통해 AWS CLI를 사용하여 EKS 인증 토큰을 얻습니다.


## **3. VPC 설정**
VPC는 AWS에서 가상 네트워크를 생성하는 서비스입니다.

```bash
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "eks-vpc"
  cidr   = "10.0.0.0/16"

  azs             = ["ap-northeast-2a", "ap-northeast-2c"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}
```
- `cidr`: VPC의 IP 주소 범위를 설정합니다.
- `azs`: 가용 영역(AZ)을 설정하여 서비스 가용성을 높입니다.
- `public_subnets`, `private_subnets`: 퍼블릭/프라이빗 서브넷을 설정합니다.
- `NAT 게이트웨이`를 사용해 프라이빗 서브넷에서도 인터넷에 접근할 수 있습니다.

## **4. EKS 클러스터 설정**
EKS (Elastic Kubernetes Service)는 AWS에서 제공하는 Kubernetes 관리형 서비스입니다.

```bash
module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name    = "eks-cluster"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}
```
- `cluster_name`, `cluster_version`: 클러스터 이름과 Kubernetes 버전을 설정합니다.
- `vpc_id`, `subnet_ids`: 앞서 만든 VPC와 서브넷을 연결합니다.

## **5. EKS 관리형 노드 그룹 설정**
Kubernetes 클러스터에서 작업을 처리할 실제 EC2 인스턴스 그룹을 설정합니다

```bash
eks_managed_node_groups = {
  demo = {
    name            = "demo-ng"
    min_size        = 1
    max_size        = 2
    desired_capacity = 1

    instance_types = ["t3.micro"]
    capacity_type  = "ON_DEMAND"
  }
}
```
- `min_size`, `max_size`: 자동 확장 설정 (최소 1개, 최대 2개 노드).
- `instance_types`: 인스턴스 유형을 설정 (t3.micro는 저렴한 비용으로 테스트에 적합).
- `capacity_type`: 온디맨드 인스턴스를 사용 (스팟 인스턴스가 아님).