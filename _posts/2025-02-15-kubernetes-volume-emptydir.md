---
layout: single
title: "Kubernetes emptyDir 볼륨 개념과 활용"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---

## **1. emptyDir 볼륨이란?**  

쿠버네티스에서 `emptyDir`은 **임시 저장소 역할을 하는 볼륨**이다.  
Pod가 생성될 때 빈 디렉터리가 생성되며, **Pod의 라이프사이클 동안 유지**되지만 **Pod가 삭제되면 데이터도 함께 삭제**된다.  
특정 컨테이너가 데이터를 유지해야 할 필요 없이, **동일한 Pod 내 여러 컨테이너가 데이터를 공유해야 할 때 유용**하다.  

### **emptyDir 볼륨의 주요 특징**  
- Pod의 라이프사이클과 동일하게 동작하며, **Pod가 삭제되면 데이터도 삭제됨**.  
- 동일한 Pod 내 **여러 컨테이너 간 데이터 공유 가능**.  
- 기본적으로 노드의 디스크를 사용하지만, `medium: Memory` 옵션을 사용하면 RAM을 스토리지로 활용할 수 있음.  

---

## **2. emptyDir 볼륨 사용 예제**  

### **기본 emptyDir 사용법**  
다음은 `emptyDir` 볼륨을 정의하고, 두 개의 컨테이너에서 공유하는 예제다.  

- `temp-container1`은 `/mount1`에 볼륨을 마운트한다.  
- `temp-container2`는 동일한 볼륨을 `/mount2`에 마운트한다.  

이렇게 하면 두 컨테이너가 동일한 데이터를 공유할 수 있다. 

```yaml
apiVersion: v1  
kind: Pod  
metadata:  
  name: temp-pod1  
spec:  
  volumes:  
  - name: temp-vol  
    emptyDir: {}  
  containers:  
  - image: ubuntu:14.04  
    name: temp-container1  
    volumeMounts:  
    - name: temp-vol  
      mountPath: /mount1  
  - image: ubuntu:14.04  
    name: temp-container2  
    volumeMounts:  
    - name: temp-vol  
      mountPath: /mount2  
```

### **emptyDir 볼륨 동작 확인**  
1. Pod를 실행한 후 컨테이너에 접속한다.  
2. `/mount1`에 `k8s-1.txt` 파일을 생성한다.  
3. 다른 컨테이너에서 `/mount2`를 확인하면 동일한 파일을 볼 수 있다.  

```bash
kubectl get po -o wide | grep temp-pod1  
kubectl exec -it temp-pod1 -c temp-container1 -- bash  
echo 'welcome! k8s volume. temp-pod1' > /mount1/k8s-1.txt  
cat /mount1/k8s-1.txt  
```
이제 `temp-container2`에서도 동일한 파일을 확인할 수 있다.  

```bash
kubectl exec -it temp-pod1 -c temp-container2 -- bash  
cat /mount2/k8s-1.txt  
```
---

## **3. emptyDir 메모리 기반 저장소 (RAM Disk) 사용하기**  

기본적으로 `emptyDir`은 노드의 디스크를 사용하지만, RAM을 스토리지로 활용할 수도 있다.  
이를 위해 `medium: Memory` 옵션을 사용하면, **tmpfs 기반의 인메모리 저장소**가 생성된다.  

### **메모리 기반 emptyDir 볼륨 예제**  
```yaml
apiVersion: v1  
kind: Pod  
metadata:  
  name: temp-mem-pod  
spec:  
  volumes:  
  - name: memory-vol  
    emptyDir:  
      medium: Memory  
      sizeLimit: 1Gi  
  containers:  
  - image: ubuntu:14.04  
    name: mem-container  
    volumeMounts:  
    - name: memory-vol  
      mountPath: /mem-mount  
```
### **메모리 기반 볼륨 확인**  
1. Pod를 실행한 후 컨테이너에 접속한다.  
2. `df -h` 명령어로 `/mem-mount`가 tmpfs로 마운트되었는지 확인한다.  

```bash
kubectl exec -it temp-mem-pod -- bash  
df -h  
```
출력 결과를 보면 `/mem-mount`가 **1Gi 크기의 tmpfs로 설정된 것**을 확인할 수 있다.

---

## **4. emptyDir 볼륨을 통한 컨테이너 간 데이터 공유**  

쿠버네티스에서는 `emptyDir`을 활용하여 컨테이너 간 데이터를 공유할 수 있다.  
다음은 `emptyDir`을 사용하여 웹 서버(Nginx)와 데이터를 제공하는 컨테이너(Alpine)가 데이터를 공유하는 예제다.  

### **웹 애플리케이션 데이터 공유**  
1. `web-source` 컨테이너는 `/source` 디렉터리에 데이터를 저장한다.  
2. `webserver` 컨테이너는 같은 데이터를 `/usr/share/nginx/html/`에 마운트하여 웹 페이지로 제공한다.  

```yaml
apiVersion: v1  
kind: Pod  
metadata:  
  labels:  
    app: myweb  
  name: myweb-pod  
spec:  
  containers:  
  - image: alpine  
    name: web-source  
    args: ["tail", "-f", "/dev/null"]  
    volumeMounts:  
    - name: source-volume  
      mountPath: /source  
  - image: nginx:1.25.3-alpine  
    name: webserver  
    volumeMounts:  
    - name: source-volume  
      mountPath: /usr/share/nginx/html/  
  volumes:  
  - name: source-volume  
    emptyDir: {}  
```

### **데이터 공유 확인**  
1. `web-source` 컨테이너에 접속하여 HTML 파일을 `/source`에 생성한다.  

kubectl cp index.html myweb-pod:/source/index.html -c web-source  

2. Nginx 웹 서버에서 해당 파일이 정상적으로 제공되는지 확인한다.  

kubectl run web-test -it --rm --restart=Never --image=curlimages/curl -- curl 10.111.156.100  

3. HTML 파일이 출력되면 정상적으로 컨테이너 간 데이터가 공유된 것이다.  

---

## **5. emptyDir 볼륨 삭제 시 데이터 유실 확인**  

`emptyDir`은 **Pod가 삭제되면 데이터도 함께 삭제**된다. 이를 확인하기 위해 Pod를 삭제하고 데이터를 확인해 보자.  

### **Pod 삭제**  
```bash
kubectl delete po temp-pod1  
```
### **파일 삭제 확인**  
Pod가 삭제되었기 때문에 `k8s-1.txt` 파일도 사라졌을 것이다.  
새로운 Pod를 생성해도 이전 데이터를 복원할 수 없다.  

---

## **6. emptyDir 볼륨 사용 시 주의사항**  

- **Pod가 삭제되면 데이터도 함께 삭제됨**  
  - 영구적인 데이터 저장이 필요하다면 `PersistentVolume`을 고려해야 함.  
- **노드 장애 시 데이터 손실 가능**  
  - `emptyDir`은 특정 노드의 디스크를 사용하기 때문에 노드 장애 발생 시 데이터가 유실될 수 있음.  
- **메모리 기반 볼륨은 RAM 용량을 초과하지 않도록 주의**  
  - `medium: Memory`를 사용할 경우 RAM 크기 내에서 스토리지를 설정해야 함.  

---

## **7. 결론**  

쿠버네티스에서 `emptyDir` 볼륨은 **Pod의 라이프사이클 동안 유지되는 임시 저장소**로,  
컨테이너 간 데이터 공유, 임시 캐시 저장, 메모리 기반 스토리지 활용 등에 유용하다.  

