---
layout: single
title:  "kubernetes 아키텍쳐"
categories: kubernetes
tag: [kubernetes]
toc: true
author_profile: false
search: true
---


# Kubernetes 아키텍처

Kubernetes는 애플리케이션을 컨테이너로 묶어 자동으로 배포하고 관리하는 **컨테이너 오케스트레이션 시스템**입니다. Kubernetes의 아키텍처는 크게 **Control Plane**과 **Node**로 구성됩니다.

---

## 1. Kubernetes 아키텍처 구성 요소

### 1.1 **Control Plane**
Control Plane은 Kubernetes 클러스터의 두뇌 역할을 하며, 클러스터의 상태를 관리하고 작업을 조율합니다.  
Control Plane의 주요 구성 요소는 다음과 같습니다:

#### **1) API 서버 (kube-apiserver)**
- Kubernetes의 "문지기" 역할.
- 모든 요청을 받아들이고, 적절한 구성 요소로 전달.
- RESTful API를 제공.

#### **2) 스케줄러 (kube-scheduler)**
- 새로 생성된 Pod가 어떤 Node에 배치될지 결정.
- 리소스 사용량, Node 상태 등을 고려하여 최적의 Node를 선택.

#### **3) 컨트롤러 매니저 (kube-controller-manager)**
- 클러스터 상태를 원하는 상태로 유지하는 역할.
- 예: Pod가 삭제되면 새로운 Pod를 생성.

#### **4) ETCD**
- 분산 키-값 데이터베이스로, 클러스터의 모든 상태 정보를 저장.
- Kubernetes의 "소스 오브 트루스(Source of Truth)".

---

### 1.2 **노드 (Node)**
Node는 실제로 애플리케이션(컨테이너)이 실행되는 **작업 공간**입니다.  
클러스터는 여러 Node로 구성되며, 각 Node는 다음과 같은 주요 구성 요소를 포함합니다:

#### **1) Kubelet**
- Node에서 Pod를 관리하는 작은 관리자.
- API 서버와 통신하며 Pod의 상태를 유지.

#### **2) 컨테이너 런타임**
- 컨테이너를 실제로 실행하는 소프트웨어.
- 예: Docker, containerd, CRI-O.

#### **3) Kube-proxy**
- 네트워크 트래픽을 관리.
- Pod 간 통신 및 외부 트래픽 라우팅을 지원.

---

### 1.3 **Kubernetes의 주요 동작**
1. **명령 요청**: 사용자가 `kubectl` 명령으로 요청을 보냅니다.
2. **Control Plane 처리**:
   - API 서버가 요청을 받고 처리.
   - 스케줄러가 Pod 배치 결정.
   - 컨트롤러 매니저가 상태를 유지.
3. **Node 작업 수행**:
   - Kubelet이 Pod를 실행.
   - 컨테이너 런타임이 컨테이너를 시작.
4. **모니터링 및 복구**:
   - 문제가 발생하면 컨트롤러 매니저가 자동으로 복구.

---

## 2. Control Plane과 마스터 노드의 관계
- **Control Plane**: Kubernetes 클러스터를 관리하는 **소프트웨어 컴포넌트 집합**입니다.
- **마스터 노드**: Control Plane이 실행되는 **물리적 또는 가상 머신**입니다.
- 마스터 노드는 Control Plane의 기능을 제공하며, 클러스터의 상태를 유지합니다.

---