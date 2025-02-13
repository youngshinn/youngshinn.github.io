---
layout: single
title: "Kubernetes Label"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---

# **Kubernetes Label**  

Kubernetes에서 **Label(라벨)**은 리소스를 그룹화하고 선택하는 핵심 기능 중 하나입니다.  
---

## **1. Label이란?**  

**Label**은 **Key-Value 기반의 속성 태그**로, 하나 이상의 값을 가질 수 있습니다.  
이를 활용하면 Kubernetes 리소스를 논리적으로 그룹화하거나 특정 리소스를 필터링할 수 있습니다.  

### **Label의 주요 특징**  
- **Key-Value 기반**으로 리소스에 메타데이터를 추가  
- **Pod, Service, Deployment 등 다양한 리소스에 적용 가능**  
- **kubectl 명령어를 통해 특정 Label이 부여된 리소스만 조회 가능**  

### ** Label이 적용된 Pod 예제**  
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mynode-pod
  labels:
    app: run-node
    job: front
```
## **2. Label 사용 방법**  

### **2-1 Label을 포함한 Pod 생성**  
```bash
kubectl run mynginx --image=nginx:1.25.3-alpine --labels=key=value
kubectl get pods --show-labels | grep mynginx
```
### **2-2 특정 Label을 가진 Pod만 조회** 
```yaml
kubectl get pods --selector=key=value
```
### **Label이 적용된 Service 예제** 
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: run-node
  ports:
  - port: 8080
``` 
**위의 설정은 `app: run-node` Label이 부여된 Pod에만 트래픽을 전달합니다.**

## **3. Annotation과 Label의 차이점**  

Kubernetes에는 **Annotation(애너테이션)** 이라는 개념도 있습니다.  
둘의 차이는 다음과 같습니다.  

### **Label과 Annotation 비교**  

| **기능**     | **Label** | **Annotation** |
|-------------|------------------|----------------|
| **역할** | 리소스를 **그룹화 및 필터링**하는 용도 | **메타데이터 저장** 용도 |
| **주요 사용처** | Pod, Service 등 **선택적 적용** | 설정 정보, 설명, 정책 전달 |
| **예제 코드** | `kubectl get pods --selector=app=web` | `kubectl describe pod my-pod` |

### **Annotation 예제**  
```yaml
metadata:
  annotations:
    examples.com/icon-url: "https://example.com/icon.png"
```

## **4. Label 활용 사례**  

### **4.1 로그 수집 및 전송**  
**Fluentd**를 사용하여 특정 Label이 포함된 Pod의 로그를 중앙 서버로 전송할 수 있습니다.  

```yaml
- name: sidecar-logger
  image: fluent/fluentd
  volumeMounts:
  - name: log-volume
    mountPath: /var/log
```

###  **4.2 네트워크 프록시 및 보안 강화**
**Envoy Proxy**를 사용하여 특정 Label을 가진 Pod만 프록시 설정할 수 있습니다.

```yaml
- name: sidecar-proxy
  image: envoyproxy/envoy
  args: ["-c", "/etc/envoy/envoy.yaml"]
  volumeMounts:
  - name: envoy-config
    mountPath: /etc/envoy
```
###  **4.3 데이터 동기화 및 캐싱**
**Redis**를 활용하여 특정 Label이 적용된 Pod에서만 데이터 캐싱을 수행할 수 있습니다.
```yaml
- name: redis-cache
  image: redis
  ports:
  - containerPort: 6379
```  
## **5. Kubernetes Label & Selector 실습**

### **5.1 Label 기반으로 Pod 생성**

```yaml
kubectl create namespace infra-team-ns1
kubectl run label-pod-a --image=dbgurum/k8s-lab:initial --namespace=infra-team-ns1 --labels=type=infra1 --dry-run=client -o yaml > label-pod.yaml
kubectl apply -f label-pod.yaml
```

### **5.2 특정 Label이 적용된 Pod만 조회**

```yaml
kubectl get pods --show-labels -n infra-team-ns1
kubectl get pods --selector='type' -n infra-team-ns1
```

## **6.Kubernetes Label & Service Selector**
Label은 Service와 연계하여 특정 Label이 있는 Pod만 대상으로 네트워크 트래픽을 전달할 수 있습니다.

### **Label 기반으로 Service 연결**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: infra-svc
spec:
  selector:
    type: infra
  ports:
  - port: 7777
``` 