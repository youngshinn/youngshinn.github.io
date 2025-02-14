---
layout: single
title:  "Kubernetes 서비스 개념과 활용"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---

## **1. Kubernetes 서비스란?**

쿠버네티스에서 **Pod는 일시적인 존재**이며, 필요에 따라 새롭게 생성되고 제거된다. 따라서 특정 Pod의 IP 주소가 변경될 가능성이 높다. 이를 해결하기 위해 **서비스(Service)** 가 사용된다.

### 왜 Kubernetes 서비스를 사용하는가?

- **Pod의 동적 IP 문제 해결**: Pod가 삭제되거나 재시작될 때마다 IP가 변경됨 → 서비스는 **고정된 네트워크 엔드포인트**를 제공
- **로드 밸런싱**: 동일한 역할을 수행하는 여러 개의 Pod를 서비스가 자동으로 분산 처리
- **내부 및 외부 접근 관리**: ClusterIP(내부 서비스)와 NodePort/LoadBalancer(외부 서비스) 설정 가능
- **서비스 디스커버리 제공**: DNS를 활용하여 Pod 간 통신 가능


## **2. Kubernetes 서비스 유형**

### **2-1. ClusterIP (기본값)**
**내부 서비스**로 클러스터 내부에서만 접근 가능 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-clusterip-service
spec:
  selector:
    app: my-app #POD 선택
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```
### **2-2. NodePort**
**클러스터 외부에서도 접근 가능**한 서비스, 각 노드의 특정 포트를 개방하여 트래픽 전달

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nodeport-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
      nodePort: 30080
  type: NodePort
```
### **2-3. LoadBalancer**
**클라우드 환경(AWS, GCP, Azure)에서 사용**, 외부 로드 밸런서를 통해 트래픽을 분산

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-loadbalancer-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
```
## **3. 서비스, kube-proxy, API 서버의 연결 구조**

### **3-1. API 서버(Kubernetes API Server)**

- 쿠버네티스 클러스터의 중심으로 **모든 요청을 처리하고 상태를 관리**한다.
- 사용자가 `kubectl apply -f service.yaml`을 실행하면, API 서버가 요청을 받고 **서비스 리소스를 생성**한다.

### **3-2. kube-proxy**

- 각 노드에서 실행되며, **서비스의 네트워크 트래픽을 관리**하는 역할을 한다.
- `iptables` 또는 `IPVS`를 사용하여 **서비스 IP로 들어오는 요청을 적절한 Pod로 전달**한다.

### **3-3. 서비스 요청 처리 과정**

1. `kubectl apply -f service.yaml` 실행 → **API 서버가 서비스 리소스를 생성**.
2. `kube-proxy`가 API 서버에서 서비스 정보를 가져와 `iptables` 또는 `IPVS`에 등록.
3. 외부 또는 내부에서 서비스에 접근하면, 요청이 **서비스의 가상 IP(ClusterIP)로 전달**됨.
4. `iptables` 또는 `IPVS` 규칙에 따라 **적절한 Pod로 트래픽이 전달**됨.


## **4. 외부에서 쿠버네티스 서비스에 접근하는 과정**

### **4-1. NodePort를 통한 외부 접근**
```bash
kubectl expose pod myapp --name=myapp-svc --port=8080 --target-port=80 --type=NodePort
```
1) 클라이언트가 `<Node IP>:<NodePort>`로 요청을 보냄

2) `kube-proxy`가 요청을 적절한 Pod로 전달

### **4-2.LoadBalancer를 통한 외부 접근 (클라우드 환경)**
```bash
kubectl expose deployment myapp --type=LoadBalancer --name=myapp-lb
```
1) 클라우드 제공자가 외부 IP를 생성하고 로드 밸런서를 배포

2) 로드 밸런서는 트래픽을 NodePort로 전달

3) NodePort에서 다시 적절한 Pod로 트래픽이 전달됨

