---
layout: single
title: "Kubernetes에서 OpenSSL과 Ingress Nginx를 활용한 보안 설정"
categories: Kubernetes
tag: [Kubernetes, OpenSSL, Ingress, DevOps]
search: true
---

## Kubernetes에서 OpenSSL과 Ingress Nginx를 활용한 보안 설정

Kubernetes 클러스터에서 외부 트래픽을 안전하게 관리하기 위해 **OpenSSL을 이용한 SSL 적용**과 **Ingress Nginx**를 활용한 트래픽 제어가 필수적입니다.

* OpenSSL을 사용하여 SSL 인증서를 생성하고 Kubernetes에서 활용하는 방법
* Ingress Nginx를 사용하여 도메인 기반 라우팅 및 보안 정책을 적용하는 방법

## **1. OpenSSL을 활용한 SSL 적용**
### **1.1 OpenSSL이란?**
OpenSSL은 SSL/TLS 프로토콜을 구현하는 오픈소스 암호화 라이브러리입니다.

**주요 기능**
* SSL/TLS 인증서 생성 및 관리
* 데이터 암호화 및 복호화
* 디지털 서명 및 검증

### **1.2 OpenSSL을 활용한 SSL 인증서 생성**

1) SSL 인증서 및 키 생성
먼저, OpenSSL을 이용하여 자체 서명된 인증서를 생성합니다.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -out server.crt -keyout server.key -subj "/CN=php.k8s.io,goapp.k8s.io"
```
출력결과
```bash
Generating a RSA private key
..................................................................+++++
...........................................................................+++++
writing new private key to 'server.key'
-----
```

2) Kubernetes Secret에 SSL 인증서 저장
생성한 SSL 인증서를 Kubernetes Secret으로 저장합니다.

```bash
kubectl create secret tls k8s-tls-secret --cert=server.crt --key=server.key
```
출력결과
```bash
secret/k8s-tls-secret created
```
3) Secret 확인
```bash
kubectl get secrets
kubectl describe secrets k8s-tls-secret
``` 

출력결과
```bash
NAME                  TYPE                DATA  AGE
k8s-tls-secret        kubernetes.io/tls   2     10s
```
```bash
Name:         k8s-tls-secret
Namespace:    default
Type:         kubernetes.io/tls
Data
====
tls.crt:      1151 bytes
tls.key:      1704 bytes
```

## **2. Ingress Nginx를 활용한 보안 방식**
### **2.1 Ingress Nginx란?**
Ingress Nginx는 Kubernetes에서 트래픽을 관리하고 라우팅하는 역할을 수행하는 컨트롤러입니다.

**Ingress Nginx의 주요 기능**
* 도메인 기반 라우팅
* SSL/TLS 지원 및 인증서 관리
* 로드 밸런싱 및 보안 정책 적용

### **2.2 Ingress Nginx를 활용한 보안 설정**

1) Ingress Nginx 배포 확인
```bash
kubectl get svc -n ingress-nginx
```
실행 결과
```bash
NAME                               TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller           LoadBalancer   10.102.158.164   <pending>     80:30288/TCP, 443:31961/TCP   3m50s
ingress-nginx-controller-admission ClusterIP     10.111.202.73    <none>        443/TC
```

2) Ingress 리소스 생성
Ingress를 활용하여 도메인 기반으로 요청을 Kubernetes 서비스로 전달합니다.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-tls-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: php.k8s.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tlsapp-php-svc
            port:
              number: 80
  - host: goapp.k8s.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tlsapp-go-svc
            port:
              number: 80
```
3) Ingress 리소스 생성 및 확인
```bash
kubectl apply -f app-tls-ing.yaml
kubectl get ingress
kubectl describe ingress app-tls-ingress
```
실행 결과
```bash
ingress.networking.k8s.io/app-tls-ingress created
```
```bash
NAME               CLASS    HOSTS                    ADDRESS          PORTS   AGE
app-tls-ingress    nginx    php.k8s.io, goapp.k8s.io 10.102.158.164   80,443  32s
```

4) Ingress 동작 테스트
Ingress가 정상적으로 동작하는지 curl 명령어를 사용하여 테스트합니다.

```bash
curl https://goapp.k8s.io:31961/ -k --resolve goapp.k8s.io:31961:127.0.0.1
curl https://php.k8s.io:31961/ -k --resolve php.k8s.io:31961:127.0.0.1
```
실행 결과
```bash
<html>
<div style="font-size:25px">
Container hostName & Port#: tlsapp-php-5ddf4fc8f9-qfvdx - <p> Docker Load Balancer = (Nginx host) + (PHP & Apache container) </p>
</div>
</body>
</html>
```

## **3. OpenSSL과 Ingress Nginx 활용 정리**
| 기능        | OpenSSL                     | Ingress Nginx               |
|------------|-----------------------------|-----------------------------|
| **역할**    | SSL 인증서 생성 및 관리      | 트래픽 관리 및 라우팅       |
| **주요 목적** | 데이터 암호화 및 인증        | 로드 밸런싱 및 보안 적용    |
| **설정 위치** | Secret으로 저장             | Ingress 리소스로 적용      |
| **보안 방식** | RSA 기반 인증서             | 도메인 기반 트래픽 제어    |

## **4. 정리**
* OpenSSL을 사용하여 SSL 인증서를 생성하고 Kubernetes Secret으로 관리할 수 있다.
* Ingress Nginx를 활용하면 Kubernetes 서비스 간 트래픽을 효율적으로 관리하고 보안을 강화할 수 있다.