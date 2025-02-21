---
layout: single
title: "Kubernetes Secret"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---

## Kubernetes Secret 

Kubernetes에서 **Secret**은 비밀번호, OAuth 토큰, SSH 키 등 **민감한 정보를 안전하게 저장하고 관리하는 방법**을 제공하는 리소스입니다.

## **1. Secret이란?**
Kubernetes에서 애플리케이션을 배포할 때 **환경 변수**를 통해 설정 정보를 제공하는 경우가 많다.
하지만 **비밀번호, API** 키와 같은 **민감한 정보를 일반적인 ConfigMap에 저장하면 보안 문제**가 발생할 수 있다.

### **Secret의 주요 특징**
**Base64** 인코딩되어 저장되므로 ConfigMap보다 보안성이 높음
**Pod에서 환경 변수 또는 Volume으로 마운트하여 사용 가능**
**RBAC(Role-Based Access Control)를 이용하여 접근 제어 가능**

## **2. Secret 생성 방법**

### **2.1. From Literal 방식**

`--from-literal` 옵션을 사용하면 CLI에서 직접 **Key-Value** 형태의 Secret을 생성할 수 있다.

**예제: 비밀번호를 Secret으로 생성하기**
```bash
kubectl create secret generic my-secret --from-literal=password=MySecret123
```

생성된 Secret 확인하기
```bash
kubectl get secrets my-secret
kubectl describe secrets my-secret
```
출력 결과:
```bash
Name:         my-secret
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
password:  12 bytes
``` 

## **2.2. From File 방식**
`--from-file` 옵션을 사용하면 파일에 저장된 데이터를 Secret으로 만들 수 있다.

**예제: 파일 내용을 Secret으로 저장하기**
먼저, 파일을 생성한다.

```bash
echo "MySecret123" > password.txt
```
이제 파일을 이용해 Secret을 생성한다.
```bash
kubectl create secret generic file-secret --from-file=password.txt
```
생성된 Secret 확인하기
```bash
kubectl get secrets file-secret
kubectl describe secrets file-secret
```
출력 결과:
```bash
Name:         file-secret
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
password.txt:  12 bytes
```
파일명이 Key가 되며, Value는 Base64로 인코딩된 상태로 저장된다.

## **3. Secret을 Pod에서 사용하는 방법**

### **3.1. 환경 변수로 사용하기**
Pod의 `envFrom`을 이용하여 Secret을 환경 변수로 설정.

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: secret-env-pod
spec:
    containers:
    - name: my-container
      image: busybox
      args: ['tail', '-f', '/dev/null']
      envFrom:
      - secretRef:
        name: my-secret
```
```bash
kubectl exec -it secret-env-pod -- env | grep password
```
출력 결과:
```bash
password=MySecret123
```

### **3.2. 볼륨으로 마운트하기**
Secret을 파일 형태로 컨테이너 내부에서 사용하려면 volumeMounts를 설정.

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: secret-volume-pod
spec:
    containers:
    - name: my-container
      image: busybox
      args: ['tail', '-f', '/dev/null']
      volumeMounts:
      - name: secret-volume
        mountPath: "/etc/secret"
        readOnly: true
        volumes:
        - name: secret-volume
          secret:
          secretName: file-secret
```

```bash
kubectl exec -it secret-volume-pod -- cat /etc/secret/password.txt
```
출력 결과:
```bash
MySecret123
```

## **4. 정리**
1. Secret은 민감한 데이터를 안전하게 저장하는 Kubernetes 리소스이다.
2. kubectl create secret generic 명령어를 이용해 생성할 수 있다.
3. --from-literal을 사용하여 CLI에서 직접 입력할 수 있다.
4. --from-file을 사용하여 파일의 데이터를 Secret으로 만들 수 있다.
5. Pod에서 Secret을 환경 변수 또는 볼륨 마운트 방식으로 사용할 수 있다.