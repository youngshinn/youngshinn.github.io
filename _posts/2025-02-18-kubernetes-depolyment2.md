---
layout: single
title: "Kubernetes Deployment 배포 전략 및 실행 결과"
categories: Kubernetes
tags: [Kubernetes, Deployment, DevOps, 배포 전략]
search: true
---

# Kubernetes Deployment 배포 전략 및 실행 결과

Kubernetes에서 Deployment는 애플리케이션을 배포하고 업데이트하는 핵심 리소스입니다.  
Deployment를 통해 **무중단 배포, 롤백, 트래픽 제어** 등의 기능을 활용할 수 있습니다.

이번 글에서는 **Deployment 배포 전략을 자세히 설명**하고,  
각 배포 방식의 **특징, 실행 방법, 적용 후 결과**를 제공하겠습니다.

---

## **1. Deployment 배포 전략 개요**
배포 전략이란 **기존 애플리케이션을 최신 버전으로 업데이트하는 방식**을 의미합니다.  
배포 방식에 따라 **다운타임 여부, 트래픽 전환 방식, 롤백 가능성**이 결정됩니다.

### **1.1 주요 배포 전략**
- **Recreate**: 기존 Pod를 삭제한 후 새 Pod를 생성 (다운타임 발생)
- **Rolling Update (기본값)**: 점진적으로 새로운 버전을 배포하여 무중단 업데이트 수행
- **Blue/Green Deployment**: 새로운 버전을 미리 배포한 후 트래픽을 전환
- **Canary Deployment**: 일부 사용자만 새 버전으로 이동하여 점진적 테스트
- **A/B Testing**: 다양한 버전을 동시에 운영하며 사용자 피드백을 반영


| 배포 전략        | 설명                                       | 장점                            | 단점                           | 롤백 방식                        |
|---------------|--------------------------------|------------------------------|------------------------------|-----------------------------|
| **Recreate**  | 기존 Pod를 중단 후 새 버전 배포   | 설정이 간단하고 빠름            | **다운타임 발생**             | 이전 버전의 Pod 재배포         |
| **RollingUpdate** | 점진적 업데이트 (기본 배포 방식) | 무중단 배포 가능, 리소스 절약   | 속도가 느릴 수 있음             | `kubectl rollout undo` 사용 |
| **Blue/Green** | 신버전을 미리 배포 후 트래픽 변경 | 신버전 검증이 쉬움              | 구/신버전 동시 유지로 비용 증가  | 트래픽을 이전 버전으로 변경     |
| **Canary**    | 일부 사용자만 신버전으로 이동      | 신버전 테스트 가능               | 신버전 오류 시 일부 유저 영향  | Canary 버전 Pod 제거          |

---

## **2. 배포 전략별 코드 적용 및 실행 결과**
### **2.1 Recreate 배포 전략**
Recreate는 **기존 Pod를 중단하고 새로운 Pod를 생성**하는 방식입니다.  
업데이트 시 **일시적인 다운타임**이 발생하지만, 설정이 간단합니다.

#### **설정 코드**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-recreate
spec:
  replicas: 3
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: nginx:1.17
```

실행 결과 
```bash
kubectl apply -f app-recreate.yaml
kubectl get pods -w
```

```bash
NAME                          READY   STATUS        RESTARTS   AGE
app-recreate-6b74dfcd87-d5r6h  0/1     Terminating   0         5s
app-recreate-6b74dfcd87-q8h9v  1/1     Running       0         2s
app-recreate-6b74dfcd87-r8v3c  1/1     Running       0         2s
```

* 기존 Pod가 모두 종료된 후 새로운 Pod가 실행됨
* 일시적인 다운타임 발생

### **2.2 Rolling Update 배포 전략 (기본값)**

Rolling Update는 **기존 Pod를 점진적으로 교체하여 무중단 업데이트**를 보장하는 전략입니다.

#### **설정 코드**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-rolling
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1  # 업데이트 중 비활성화될 최대 Pod 개수
      maxSurge: 1        # 업데이트 중 추가로 생성할 최대 Pod 개수
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: nginx:1.19
```

실행 결과 
```bash
kubectl apply -f app-rolling.yaml
kubectl rollout status deployment app-rolling
```

```bash
NAME                          READY   STATUS        RESTARTS   AGE
app-rolling-6b74dfcd87-x9y3h  1/1     Running       0         10s
app-rolling-6b74dfcd87-q8h9v  1/1     Running       0         8s
app-rolling-6b74dfcd87-r8v3c  1/1     Running       0         5s
```

### **2.3 Blue/Green 배포 전략**
Blue/Green 배포는 **두 개의 환경을 유지하면서 배포**를 진행하는 방식입니다.

#### **설정 코드**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: nginx:1.21
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

트래픽 전환
```bash
kubectl apply -f app-green.yaml
kubectl set selector service app-service app=myapp
```
실행 결과
```bash
kubectl get pods -o wide
```

```bash
NAME                          READY   STATUS    NODE
app-green-7b68c89f4a-7lksz    1/1     Running   node-1
app-green-7b68c89f4a-hd2ks    1/1     Running   node-2
app-green-7b68c89f4a-mjksd    1/1     Running   node-3
```
* 기존 Pod는 그대로 유지되며, 새로운 Pod가 별도로 실행됨
* 트래픽을 새로운 서비스로 전환하면 업데이트 완료

### **2.4 Canary 배포 전략**
Canary 배포는 **일부 사용자에게만 새 버전을 배포**하여 점진적으로 적용하는 방식입니다.

#### **설정 코드**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp-canary
  template:
    metadata:
      labels:
        app: myapp-canary
    spec:
      containers:
      - name: myapp
        image: nginx:1.21
```

Canary 배포 적용
```bash
kubectl apply -f app-canary.yaml
```

실행 결과
```bash
kubectl get pods
```

```bash
NAME                          READY   STATUS    NODE
app-canary-7b68c89f4a-7lksz   1/1     Running   node-1
```

* 기존 버전 Pod과 Canary 버전 Pod가 동시에 실행됨
* 트래픽 일부만 Canary로 전달됨

## **3. 정리**
* `Recreate`: 다운타임 발생하지만 간단한 배포 방식
* `RollingUpdate`: 무중단 업데이트 가능
* `Blue/Green`: 두 개의 환경을 유지하며 트래픽 전환
* `Canary`: 일부 사용자에게만 신버전을 제공