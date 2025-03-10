---
layout: single
title: "Linux 환경에서 Docker 설치(Ubuntu)"
categories: Docker
tag: [Docker, DevOps, Container]
search: true
---
# ** Ubuntu linux에서 Docker 설치하기 

## 1. 필요한 패키지 설치 

```bash
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
```
 Ubuntu 또는 Debian 계열 리눅스에서 **패키지 관리 시스템(Apt)**을 사용하여 필수 패키지들을 설치하는 과정

### **1.1 Docker 공식 GPG 키 추가**
 ```bash 
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```
- 디렉터리 생성: GPG 키를 안전하게 저장할 위치 마련.
- 키 다운로드: Docker의 공식 GPG 키를 가져옴.
- 읽기 권한 부여: APT가 GPG 키에 접근할 수 있도록 설정.


### **1.2 Docker 저장소 추가**
 ```bash 
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```
-  Docker의 패키지를 안전하게 설치할 수 있도록 GPG 키를 등록하고,
Docker의 공식 패키지 저장소를 APT 소스 목록에 추가하여 최신 Docker 패키지를 설치할 수 있게 해줍니다.
- dpkg --print-architecture와 VERSION_CODENAME을 사용하여 자동으로 시스템에 맞는 패키지를 설정할 수 있습니다.

## **2. Docker 설치**

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## **3. 현재 사용자를 Docker 그룹에 추가**

```bash
sudo usermod -aG docker $USER
```
- `sudo usermod -aG docker $USER` 명령어는 Docker 사용 시 매번 sudo를 입력할 필요 없이, 사용자를 Docker 그룹에 추가하여 편리하게 Docker 명령어를 실행할 수 있게 만들어 줍니다.