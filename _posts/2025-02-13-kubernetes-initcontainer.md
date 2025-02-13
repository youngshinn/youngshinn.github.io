---
layout: single
title:  "Kubernetes init container 만들기"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---
# Kubernetes init container 만들기
<div class='notice--success'>
 <h4>학습 </h4>
 <ul>
    <li>fastcampus - 실무까지 한 번에 끝내는 Devops를 위한 Docker & kubernetes</li>
    <li>도서: 시작하세요! Docker와 kubernetes</li>
</ul>
</div>

Kubernetes에서 `init container`는 애플리케이션 컨테이너가 실행되기 전에 실행되는 컨테이너로, 주로 초기화 작업을 수행하는 역할을 합니다. 


## 1. Init Container란?  
`init container`는 **애플리케이션 컨테이너가 실행되기 전**에 **순차적으로 실행되는 특수한 컨테이너**입니다. 일반적으로 다음과 같은 작업을 수행할 때 사용됩니다.  

- **데이터 초기화**: 데이터베이스 마이그레이션, 캐시 프리로드 등의 작업 수행  
- **환경 준비**: Config 파일 다운로드, 환경 변수 설정 등  
- **서비스 의존성 해결**: 특정 서비스(예: 데이터베이스, 메시지 브로커)가 준비될 때까지 대기  

`init container`는 **모든 init container가 완료된 후**에야 애플리케이션 컨테이너가 실행됩니다.  

## 2. Init Container 동작 방식  
Kubernetes Pod에서 `init container`는 다음과 같은 순서로 실행됩니다.  

1. Pod이 실행될 때 **모든 init container가 순차적으로 실행**됨  
2. 모든 init container가 완료되어야 애플리케이션 컨테이너가 시작됨  
3. init container가 실패하면 **Pod이 재시작됨**  

즉, 애플리케이션 컨테이너보다 먼저 실행되며, 정상적으로 종료된 경우에만 다음 단계로 진행됩니다.  

## 3. Init Container 예제  
다음은 `init container`를 사용하여 **애플리케이션 컨테이너 실행 전 특정 파일을 생성하는 예제**입니다.  

### 3.1 Init Container가 포함된 Pod YAML 예제  

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-container-example
spec:
  containers:
  - name: app-container
    image: busybox
    command: ["sh", "-c", "cat /data/init.txt && echo 'App Container 실행 완료'"]
    volumeMounts:
    - name: init-data
      mountPath: /data
  initContainers:
  - name: init-container
    image: busybox
    command: ["sh", "-c", "echo 'Init Container 실행 완료' > /data/init.txt"]
    volumeMounts:
    - name: init-data
      mountPath: /data
  volumes:
  - name: init-data
    emptyDir: {}
``` 

### 3.2 코드 설명  
- **`initContainers`**: `init-container`가 실행되며 `/data/init.txt` 파일을 생성합니다.  
- **`volumes`**: `emptyDir` 볼륨을 사용하여 `init container`와 `app container`가 데이터를 공유하도록 설정합니다.  
- **`containers`**: `app-container`가 실행되면서 `init.txt` 파일의 내용을 출력합니다.  

### 3.3 실행 및 결과 확인  

```bash
kubectl apply -f init-container.yaml
kubectl logs init-container-example -c init-container
kubectl logs init-container-example -c app-container
```

실행 결과는 다음과 같이 출력됩니다.  

```bash
Init Container 실행 완료
App Container 실행 완료
``` 

## 4. Init Container의 주요 활용 사례  

### 4.1 애플리케이션 컨테이너 의존성 해결  
어떤 서비스가 **특정 조건**을 만족할 때까지 기다려야 하는 경우, `init container`를 활용할 수 있습니다.  
예를 들어, 애플리케이션이 실행되기 전에 **데이터베이스가 정상적으로 실행되는지 확인**하려면 다음과 같이 작성할 수 있습니다.  

```yaml
initContainers:
- name: wait-for-db
  image: busybox
  command: ["sh", "-c", "until nc -z db-service 3306; do echo waiting for db; sleep 2; done"]
```

이 컨테이너는 db-service:3306 포트가 열릴 때까지 대기하며, 데이터베이스가 준비된 후에야 애플리케이션 컨테이너가 실행됩니다.

### 4.2 Config 파일 다운로드 및 설정 
애플리케이션 실행 전에 **특정 환경 설정 파일**을 다운로드하여 컨테이너 내에 배치하는 것도 가능합니다.

```yaml
initContainers:
- name: fetch-config
  image: busybox
  command: ["sh", "-c", "wget -O /config/config.yaml https://example.com/config.yaml"]
  volumeMounts:
  - name: config-volume
    mountPath: /config
``` 