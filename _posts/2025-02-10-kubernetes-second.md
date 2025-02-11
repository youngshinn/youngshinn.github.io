---
layout: single
title:  "Kubernetes CNI와 Calico"
categories: Kubernetes
tag: [Kubernetes, Devops]
toc: true
author_profile: false
search: true
---

# Kubernetes와 CNI: Calico 네트워크 관리

Kubernetes에서 네트워크는 클러스터 내 모든 Pod와 서비스 간의 연결을 지원하기 위한 핵심 구성 요소입니다. 이를 구현하기 위해 CNI(Container Network Interface) 플러그인을 사용하며, 이번 글에서는 **Calico**를 중심으로 Kubernetes의 네트워크 설정을 탐구합니다.

---

## 1. CNI와 Calico란?

### CNI (Container Network Interface)
CNI는 컨테이너와 네트워크를 연결하기 위한 표준 인터페이스입니다. Kubernetes는 네트워크 플러그인으로 CNI를 사용하며, 다양한 CNI 구현체 중 **Calico**는 고성능과 보안 기능으로 많이 사용됩니다.

### Calico
Calico는 Kubernetes 네트워크 정책과 IP 관리(IPAM)를 제공하는 오픈소스 네트워크 플러그인입니다. 특히 **BGP (Border Gateway Protocol)**를 기반으로 네트워크 라우팅을 처리하며, 클러스터 내 Pod 간의 통신을 효율적으로 관리합니다.

---

## 2. Calico IPAM: IP 관리와 할당

### IP 풀 조회
다음 명령을 통해 Calico의 IP 풀 상태를 확인할 수 있습니다:

```bash
kubectl exec -n kube-system calicoctl -- calicoctl ipam show
```

### IP 블록 세부 조회
각 IP 블록의 상세 상태는 아래 명령으로 확인 가능합니다:

```bash
kubectl exec -n kube-system calicoctl -- calicoctl ipam show --show-blocks
```

## 3. Pod 배포 및 IP 할당

### Nginx Pod 배포
다음 명령어로 Nginx Pod를 배포합니다:

```bash
kubectl run ip-check --image=nginx 
```

Pod의 상태를 확인한 후 할당된 IP를 조회합니다.
```bash
kubectl get po -o wide | grep ip-check 
```

### Pod의 IP 확인
Poddp 할당된 IP는 다음 명령으로 확인합니다.

```bash
kubectl exec -n kube-system calicoctl -- calicoctl ipam show --show-blocks
```

## 4. 네트워크 라우팅

### 라우팅 테이블 확인
Pod 간 라우팅은 Calico가 관리하며, 다음 명령으로 라우팅 테이블을 조회할 수 있습니다.

```bash
ip -c route | grep bird 
```

### 인터페이스 정보 
네트워크 인터페이스 정보를 조회하는 명령어
```bash
ip -c addr show 
```

## 5. Calico 명령어 도움말
Calicoctl 명령어 사용법 확인하는 방법 
```bash 
kubectl exec -n kube-system calicoctl -- calicoctl -h 
```

## 6. Pod 통신 테스트

### Nginx Pod 접속 테스트
배포된 Nginx Pod의 IP로 curl을 실행하여 통신 가능여부를 확인합니다.
```bash
curl <Pod_IP>
```

