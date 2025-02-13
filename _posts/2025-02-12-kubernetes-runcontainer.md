---
layout: single
title:  "Kubernetes Runtime container 만들기"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---
# Kubernetes Runtime container 만들기(애플리케이션 컨테이너)
<div class='notice--success'>
 <h4>학습 </h4>
 <ul>
    <li>fastcampus - 실무까지 한 번에 끝내는 Devops를 위한 Docker & kubernetes</li>
    <li>도서: 시작하세요! Docker와 kubernetes</li>

</ul>
</div>

## Runtime container란?

**Runtime Container**는 Pod 내에서 실행되는 애플리케이션 컨테이너를 의미합니다. Kubernetes의 Pod는 하나 이상의 컨테이너를 포함할 수 있으며, 애플리케이션 실행을 위한 가장 작은 배포 단위입니다.

### Pod의 역할 
Pod는 하나 이상의 컨테이너를 포함하며, 이 컨테이너들은 동일한 네트워크 및 스토리지를 공유합니다.

Kubernetes의 Deployment 객체를 사용하면 Pod를 생성, 업데이트, 롤백할 수 있습니다.

### Pod 내 컨테이너 예시 
```bash
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx
  labels:
    app: nginx
spec:
  containers:
  - name: nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80
```

## 컨테이너 이미지 생성 및 업로드

### 1) Dockerfile 작성
```bash
FROM nginx:1.23.1-alpine
RUN mkdir -p /usr/share/nginx/html/assets
RUN mkdir -p /usr/share/nginx/html/css
RUN mkdir -p /usr/share/nginx/html/js
COPY index.html /usr/share/nginx/html/index.html
COPY assets /usr/share/nginx/html/assets
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2) Docker 이미지 빌드 

```bash
docker build -t mymotto:1.0 .
docker images | grep mymotto
``` 

### 3) 실행 테스트 
```bash
docker run -d --name=mymotto -p 8001:80 mymotto:1.0
curl localhost:8001
```

### 4) Docker Hub에 푸시 
```bash
docker tag mymotto:1.0 본인ID/mymotto:1.0 #Docker Hub ID 입력 
docker push 본인ID/mymotto:1.0
```


## Kubernetes에 배포하기 

### 1) 배포(명령어)
```bash 
kubectl run mymotto --image=본인ID/mymotto:1.0 --port=80 --dry-run=client -o yaml > mymotto.yaml #Docker Hub ID
kubectl apply -f mymotto.yaml
kubectl get pods 
```

### 2) Service 연결 
```bash 
kubectl expose pod mymotto --name=mymotto-svc --port=8002 --target-port=80 --type=NodePort #NodePort 방식으로 연결 
kubectl get svc
```

## Deployment를 활용한 배포 

### 1) Deployment 생성 
```bash
kubectl create deployment mymotto-deploy --image=본인ID/mymotto:1.0 --port=80 --replicas=3 --dry-run=client -o yaml > mymotto-deploy.yaml
kubectl apply -f mymotto-deploy.yaml
```

### 2) 배포 확인
```bash
kubectl get deploy,po,svc -o wide | grep mymotto-deploy
```

### 3) NodePort를 통한 서비스 노출 
```bash
kubectl expose deployment mymotto-deploy --name=mymotto-deploy-svc --port=8003 --target-port=80 --type=NodePort
kubectl get svc
```

## Kubeshark를 통한 네트워크 트래픽 확인 
**Kubeshark**를 활용하면 Pod 간 네트워크 트래픽을 실시간으로 모니터링할 수 있습니다.

```bash
ks tap -n default "(calico*|mymotto*)"
``` 

**127.0.0.1:8899**(Linux 환경 Firefox) 접속으로 트래픽 확인 

![Kubeshark 트래픽 확인](/assets/images/kubeshark.png)