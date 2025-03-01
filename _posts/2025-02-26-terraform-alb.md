---
layout: single
title:  "Terraform을 이용한 EC2 및 ALB 배포"
categories: Terraform
tag: [Terraform, Aws]
search: true
---

## **Terraform으로 EC2 및 ALB 배포**

## **1. Terraform 기본설정** 
```bash
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=5.79.0"
    }
  }
}
provider "aws" {
  region = "ap-northeast-2"
}
```
* `required_version`: Terraform의 최소 버전을 지정합니다.
* `provider` 블록에서 AWS 리전은 서울(ap-northeast-2)로 설정하여 리소스가 해당 리전에 생성되도록 합니다.

## **2. VPC(Virtual Private Cloud) 모듈** 

```bash
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "demo-vpc"
  cidr   = "10.0.0.0/16"

  azs             = ["ap-northeast-2a", "ap-northeast-2c"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}
```
* `terraform-aws-modules/vpc/aws` 모듈을 활용하여 VPC를 쉽게 생성할 수 있습니다.
* `NAT Gateway`를 사용해 Private Subnet에서도 인터넷 접근이 가능합니다.
* Public과 Private 서브넷을 2개씩 구성하여 고가용성을 제공합니다.

## **3. 보안 그룹(Security Group) 설정** 

```bash
resource "aws_security_group" "demo_alb_sg" {
  name        = "demo-alb-sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}
``` 
* `ingress`: HTTP(80번 포트) 트래픽을 허용합니다.
* `egress`: 모든 아웃바운드 트래픽을 허용합니다.

## **4. EC2 인스턴스 배포** 

```bash
resource "aws_instance" "demo_ec2" {
  for_each               = toset(["1", "2"])
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = module.vpc.private_subnets[tonumber(each.key) % 2]
  vpc_security_group_ids = [aws_security_group.demo_ec2_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              apt update
              apt install -y nginx
              systemctl start nginx
              systemctl enable nginx
              EOF
}
```
* `for_each`를 사용하여 두 개의 EC2 인스턴스를 배포합니다.
* `user_data` 스크립트를 통해 Nginx 웹 서버를 자동으로 설치하고 실행합니다.

## **5. Application Load Balancer(ALB) 설정** 
```bash
resource "aws_lb" "demo_alb" {
  name     = "demo-alb"
  internal = false

  load_balancer_type = "application"
  subnets            = [module.vpc.public_subnets[0], module.vpc.public_subnets[1]]
  security_groups    = [aws_security_group.demo_alb_sg.id]
}
``` 
* ALB는 Public 서브넷에 연결되어 인터넷을 통해 접근할 수 있습니다.

## **Terraform 배포 과정**

초기화: Terraform 플러그인 및 모듈을 다운로드합니다.
```bash
terraform init
```
계획 수립: 실제 적용 전 리소스 배포 계획을 미리 확인합니다.
```bash
terraform plan
```
리소스 생성: 작성된 코드에 따라 실제 AWS 리소스를 생성합니다.
```bash
terraform apply
```
ALB의 DNS 확인: 생성된 ALB의 DNS 이름을 확인하여 브라우저에서 접속할 수 있습니다.
```bash
terraform state show aws_lb.demo_alb
```
