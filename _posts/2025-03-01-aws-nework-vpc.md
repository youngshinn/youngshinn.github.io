---
layout: single
title:  "AWS VPC 네트워크 보안 및 Bastion Host 접속 실습"
categories: AWS
tag: [vpc, Aws, Network]
search: true
---

# AWS VPC 설정 및 EC2 접속 방법

AWS의 VPC(Virtual Private Cloud)를 활용하여 **보안성을 강화한 네트워크 구성**을 실습합니다.  
특히, **Bastion Host를 통한 Private EC2 접속**을 설정하고 검증하는 과정에 대해 설명합니다.

---

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
AWS 보안 그룹(Security Group)을 활용하여 **각 인스턴스의 접근 권한을 제어**합니다.

### **Bastion Host (Public) 보안 그룹**
- **SSH (22번 포트) 허용**: 특정 IP에서만 접속 가능.
- **아래 설정을 확인하세요.**
  
```plaintext
소스: <사용자의 공용 IP>/32  (예: 203.0.113.45/32)
프로토콜: TCP
포트: 22
```

### 보안 주의사항
`0.0.0.0/0 `으로 설정하면 모든 IP에서 접근 가능해져 보안에 취약해짐.
반드시 사용자의 공용 IP만 허용하도록 설정할 것.

## **3. Bastion Host를 통한 Private EC2 접속**

### **3.1 Bastion Host(public) 접속**

```sh
ssh -i ~/shin-vpc.pem ec2-user@43.201.9.202
``` 
**Bastion Host 접속 성공 화면**
![bastion 접속](/assets/images/bastion.png)

 
### **3.2 Bastion Host에서 Private EC2 접속**
Bastion에 접속한 후, Private EC2에 SSH 연결합니다.

```sh
ssh -i ./shin-vpc.pem ec2-user@10.10.4.4
``` 
**Private EC2 접속 성공 화면**
![bastion - private 접속](/assets/images/bastion-private.png)


### **3.3 Bastion Host에서 Private EC2 접속이 불가능한 경우**
만약 **Private EC2에 접속할 수 없는 경우**, 보안 그룹 설정을 확인해야 합니다.

**보안 그룹 확인 방법**
- Private EC2의 보안 그룹 설정을 확인
- Private EC2의 **Inbound Rule(인바운드 규칙)**에서 **Bastion Host의 Private IP**가 허용되어야 함.
- Bastion Host의 Private IP가 10.10.2.76/32 로 설정되어 있는지 확인.

**Bastion Host에서 Private EC2로 접속 시도 시 실패 예제**
![ipfail](/assets/images/ipx.png)

잘못된 IP 설정 시 접속 실패 화면
![ip-fail](/assets/images/ip-fail.png)




