---
layout: single
title:  "Kubernetes Pod"
categories: Kubernetes
tag: [Kubernetes, Dveops]
toc: true
author_profile: false
search: true
---

# Kubernetes Pod 관리 개요


## 1. Pod란?

**Pod는 Kubernetes의 기본적인 배포 단위**로, 하나 이상의 container를 포함합니다.
Kubernetes는 개별 컨테이너를 하나씩 배포하는 것이 아니라 **Pod 단위로 배포하는 방식**을 사용합니다.

### Pod의 특징

하나의 Pod 내부에 여러 개의 컨테이너가 포함될 수 있음

같은 네트워크 네임스페이스와 스토리지를 공유하여 원활한 통신 가능

Pod는 일시적인 단위로, 특정 노드에서 실행되며, 필요 시 자동으로 다시 생성됨

### Pod 내부 컨테이너의 종류 (설계 패턴)

**Runtime Container**: 실제 애플리케이션을 실행하는 기본 컨테이너

**Init Container**: Pod 기동 시점에만 실행되고 종료되는 컨테이너 (초기 설정 목적)

**Sidecar Container**: 보조 역할을 수행하는 컨테이너 (예: 로깅, 모니터링, 프록시)

## 2. 컨테이너가 아닌 Pod로 추상화한 이유

Kubernetes는 단순히 컨테이너 하나를 배포하는 것이 아니라, Pod이라는 단위로 추상화하여 더 유연한 배포 구조를 제공합니다.

### Pod 추상화의 핵심 이유

**Pause container를 통해 HostOS의 namespace (lsns, Linux kernel 기술) 공유**

Pod 내부의 컨테이너들은 Pod 외부와 격리되면서도 내부적으로는 자원 (network, storage)을 공유

Pod 내부의 컨테이너는 **IPC, Network, PID, File System**을 공유

Pod 내부의 프로세스는 localhost를 통해 상호 접근 가능

여러 개의 컨테이너를 하나의 namespace로 묶어 관리하는 아키텍처 적용

**Kubernetes의 기본 배포 단위를 컨테이너가 아닌 Pod으로 설정**

## 3. Pause Container란?

**Pod가 실행될 때 pause라는 컨테이너가 먼저 실행**되며, 이 컨테이너의 **namespace를 Pod 내부의 모든 컨테이너들이 공유**합니다.

### Pause Container의 역할

Kernel 기술을 활용하여 cgroups, namespace를 설정

호스트의 자원을 제한하여 각 컨테이너에 할당하는 역할 수행

독립적인 공간을 논리적으로 생성하여 각 컨테이너가 격리된 환경을 유지하도록 도움

SIGINT, SIGTERM 신호를 받을 때까지 동작하지 않고 sleep 상태로 대기 

**Pause Container 확인방법 **

```bash
ps -ef | grep pause #현재 실행중인 pause 컨테이너 확인
pstree #프로세스 트리에서 pause 컨테이너 확인 
```
## 4. Single Container Pod vs Multi Container Pod

### Single Container Pod

애플리케이션 실행에 필요한 종속성을 제공하는 단일 컨테이너를 호스팅

생성이 간단하며 Kubernetes가 개별 컨테이너를 간접적으로 제어 가능

### Multi Container Pod

서로 의존하거나 동일한 리소스를 공유하는 컨테이너들을 포함

내부 컨테이너들은 같은 네트워크를 사용하며 동일한 스토리지 볼륨에 액세스 가능

Kubernetes는 Multi Container Pod를 단일 단위로 관리

## 5. kubectl을 활용한 Pod 관리

### 명령형 문법 (Imperative Syntax)

**Kubernetes 리소스를 직접 생성하고 관리하는 CLI 방식입니다.**
```bash
# 명령어 도움말 확인
kubectl create -h

# 특정 이미지를 기반으로 Deployment 생성
kubectl create deployment my-app --image=nginx

# 특정 이미지를 기반으로 Pod 생성
kubectl run my-pod --image=nginx

# Pod를 서비스로 노출 (expose)
kubectl expose pod my-pod --type=NodePort --port=80
```
### 선언형 문법 (Declarative Syntax)

**YAML 파일을 활용하여 Kubernetes 리소스를 선언적으로 생성 및 관리하는 방식입니다.**
```bash
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: my-app
spec:
  containers:
    - name: nginx-container
      image: nginx
      ports:
        - containerPort: 80 
``` 

```bash
# YAML 파일을 적용하여 Pod 생성
kubectl apply -f my-pod.yaml

# Pod 목록 조회 (출력 형식 지정 가능)
kubectl get pod -o wide

# Pod 상세 정보 조회
kubectl describe pod my-pod

# Pod 삭제
kubectl delete pod my-pod
```