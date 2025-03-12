---
layout: single
title:  "AWS VPC 네트워크 기초 및 보안 설정 실습"
categories: AWS
tag: [vpc, Aws, Network]
search: true
---

# AWS VPC 설정 및 EC2 접속 방법

## **1. VPC 구성 및 서브넷 설정**
VPC 구성 시 **Public**과 **Private 서브넷**을 구분하여 설정합니다.

- **Public 서브넷**: 인터넷 게이트웨이(IGW)를 통해 외부 인터넷과 연결됨.
- **Private 서브넷**: 외부 인터넷 연결 없이, Bastion Host를 통해 접근 가능.

###  **VPC 리소스 맵**
아래는 설정한 VPC 정보입니다.

![VPC 구조](/assets/images/aws-vpc.png)

- VPC CIDR: `10.10.0.0/16`
- Public Subnet: `10.10.1.0/24`
- Private Subnet: `10.10.2.0/24`
- Internet Gateway(IGW) 및 NAT Gateway 설정

---

##  2. 보안 그룹(Security Group) 설정

### **Bastion Host (Public) 보안 그룹**
- **SSH (22번 포트) 허용**: 특정 IP에서만 접속 가능.
- **아래 설정을 확인하세요.**
  
```plaintext
소스: 10.10.2.76/32 (허용된 IP)
프로토콜: TCP
포트: 22
```
## **3. Bastion Host를 통한 Private EC2 접속**

### **3.1 Bastion Host(public) 접속**

```sh
ssh -i ~/shin-vpc.pem ec2-user@43.201.9.202
``` 
![bastion 접속](/assets/images/bastion.png)

 
### **3.2 Bastion Host에서 Private EC2 접속**
Bastion에 접속한 후, Private EC2에 SSH 연결합니다.

```sh
ssh -i ./shin-vpc.pem ec2-user@10.10.4.4
``` 

![bastion - private 접속](/assets/images/bastion-private.png)


### **3.3 Bastion Host에서 Private EC2 접속 불가능한 경우**
pivate 인바운드 규칙 편집으로 승인되지 않는 ip로 변경 시 접속 불가능 
**승인 받은 IP = bastion private ip**

![ipfail](/assets/images/ipx.png)

접속 시도 시 접속이 제한되고 있음.
![ip-fail](/assets/images/ip-fail.png)




