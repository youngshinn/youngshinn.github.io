---
layout: single
title: "Kubernetes Deployment 개념과 실습"
categories: Kubernetes
tags: [Kubernetes, Deployment, DevOps]
search: true
---

## Kubernetes Deployment 개념과 실습

Kubernetes에서 Deployment는 컨테이너화된 애플리케이션을 배포하고 관리하는 핵심 리소스입니다.  
Deployment를 활용하면 **애플리케이션의 확장성, 롤링 업데이트(rolling update), 자동 복구** 기능을 활용할 수 있습니다.

이 글에서는 **Deployment의 개념과 역할**, 그리고 실제 **배포 YAML 작성 및 커맨드 실행 과정**을 살펴보겠습니다.

---

## **1. Kubernetes Workload Resources**
Kubernetes에서 Pod는 애플리케이션 배포의 기본 단위이지만, 단독으로 **Orchestration의 장점**을 모두 활용하기 어렵습니다.

### **1.1 Pod만으로 부족한 이유**
Pod를 직접 생성하면 다음과 같은 문제점이 발생합니다.
- **Scaling(확장성 부족)**: Pod의 개수를 조정하려면 수동 작업이 필요
- **Rolling Update 불가능**: 새 버전 배포 시 다운타임 발생 가능
- **Automatic Healing(자동 복구 미지원)**: Pod가 중단되면 직접 다시 실행해야 함

이러한 문제를 해결하기 위해 **Deployment와 같은 workload 리소스**를 사용합니다.

![Kubernetes Workload Resources 개요](/assets/images/k8s-deployment.png)

> *출처: [shipit.dev](https://shipit.dev/posts/kubernetes-overview-diagrams.html)*

---

## **2. Deployment 개념**
### **2.1 Deployment란?**
Deployment는 Kubernetes에서 컨테이너화된 애플리케이션을 관리하기 위한 기본 빌딩 블록입니다.

- **애플리케이션 → 컨테이너 → Pod → ReplicaSet → Deployment**  
- Deployment는 **복제된 Pod 집합을 관리하고 확장하는 상위 리소스**  
- **원하는 상태를 선언하면 Deployment Controller가 이를 유지**  


### **2.2 Deployment가 필요한 이유**
Deployment를 활용하면 다음과 같은 이점을 얻을 수 있습니다.
- **ReplicaSet Rollout**을 통해 Pod 복제본 및 이미지 버전 관리
- **Pod의 지속적인 상태 관리** (Desired state management)
- **CPU/Memory 사용량 기반 자동 확장(HPA)**
- **Rolling update를 통한 무중단 업데이트**
- **버전 이력을 저장하여 Rollback 가능**
- **사용되지 않는 ReplicaSet 자동 정리**

---

## **3. Deployment 실습**
### **3.1 Deployment YAML 파일 작성**
다음은 `mydb`라는 Deployment를 정의하는 YAML 예제입니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mydb
  labels:
    app: mydb
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mydb
  template:
    metadata:
      labels:
        app: mydb
    spec:
      containers:
        - name: k8s-lab
          image: shin1031/pratice:1.0 
          ports:
            - containerPort: 8080
      envFrom:
        - configMapRef:
            name: mydb-cnf
      env:
        - name: MYSQL_USER
          valueFrom:
            secretKeyRef:
              name: my-db-secret
              key: user
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: my-db-secret
              key: userpwd
```

### **3.2 Deployment 배포 및 확인**
이제 `Deployment`를 생성하고 배포 상태를 확인합니다.

1. **Secret 및 ConfigMap 생성**

```bash
kubectl create secret generic mydb-secret --from-literal=user=shin --from-literal=userpwd=pwd1234
kubectl create configmap mydb-cnf --from-literal=dbhost="192.168.56.200" --from-literal=port=3306
```

2. **Deployment 생성**
```bash
kubectl apply -f mydb.yaml
```

3. **Deployment 및 Pod 상태 확인**
```bash
kubectl get deploy,rs,po -o wide | grep mydb
``` 

출력예시 
```bash
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/mydb  2/2     2            2          27s
```

4. **서비스(Service) 생성 및 외부 노출**
```bash
kubectl expose deployment mydb --name=mydb-svc --port=80 --target-port=8080 --type=NodePort
```

5. **서비스 확인** 
```bash
kubectl get svc | grep mydb
```


출력예시 
```bash
NAME       TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
mydb-svc   NodePort   10.106.125.2  <none>        80:30592/TCP   14s
```

## **4. Rolling Update & Rollback**
Deployment를 활용하면 애플리케이션을 **무중단 업데이트(rolling update)** 할 수 있습니다.

### **4.1 이미지 업데이트**
```bash
kubectl set image deployment mydb shin1031/pratice=2.0
```

### **4.2 업데이트 상태 확인**
```bash
kubectl rollout status deployment mydb
```

### **4.3 이전 버전 이력 조회**
```bash
kubectl rollout history deployment mydb
```

출력예시 
```bash
REVISION    CHANGE-CAUSE
1           <none>
2           <none>
```

### **4.4. 특정 버전으로 롤백**
```bash
kubectl rollout undo deployment mydb --to-revision=1
```
## **5. Deployment 관리 Best Practices**

### ** Label 및 Annotation 활용 **
Deployment 리소스는 `Label`을 통해 세부적으로 관리할 수 있습니다.

```yaml
metadata:
  annotations:
    kubernetes.io/change-cause: "Deployment v1.2 - Security Patch"
``` 
###  **Resource 요청 및 제한 설정** 
Pod이 클러스터 리소스를 과도하게 사용하지 않도록 설정합니다.

```yaml
resources:
  requests:  
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```     

## **Liveness & Readiness Probe 설정** 
Pod의 상태를 모니터링하고 비정상 상태일 경우 재시작합니다.

```yaml 
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 3
  periodSeconds: 10
``` 

## **6. 정리**
* Deployment는 Kubernetes에서 애플리케이션을 배포하고 관리하는 핵심 리소스
* ReplicaSet을 통해 확장성을 유지하고, Rolling Update 및 Rollback 지원
* 실제 YAML 파일을 작성하고 kubectl 명령어를 활용하여 배포 관리
* Best Practices를 적용하여 안정적인 Kubernetes 운영 가능