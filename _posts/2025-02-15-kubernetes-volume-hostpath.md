---
layout: single  
title: "Kubernetes HostPath 및 NFS 볼륨 개념과 활용"  
categories: Kubernetes  
tag: [Kubernetes, DevOps]  

search: true  
---

## **1. HostPath 볼륨이란?**  

쿠버네티스에서 `hostPath`는 **호스트 노드의 특정 디렉터리를 컨테이너에 마운트하는 방식**의 볼륨이다.  
이를 통해 컨테이너가 노드의 로컬 디스크에 직접 접근할 수 있으며, **Pod가 삭제되더라도 데이터는 유지된다.**  

### **HostPath 볼륨의 주요 특징**  
- **Pod 삭제 후에도 데이터 유지됨** (단, 노드가 삭제되면 데이터도 사라짐)  
- **노드의 특정 경로를 직접 컨테이너에 마운트**  
- **Pod가 특정 노드에서만 실행될 가능성이 있음** (다른 노드에서는 해당 디렉터리가 존재하지 않을 수 있음)  

---

## **2. HostPath 볼륨 사용 예제**  

다음은 `hostPath` 볼륨을 설정하여 `/DATA1/shin` 디렉터리를 컨테이너에 마운트하는 예제다.  

### **hostPath 볼륨을 가진 Pod 생성**  

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: host-pod1
spec:
    volumes:
    - name: host-path
      hostPath:
      path: /DATA1/shin
      type: DirectoryOrCreate
    containers:
    - image: dbgurum/k8s-lab:initial
      name: container
      volumeMounts:
      - name: host-path
        mountPath: /mount1
``` 

---

## **3. HostPath 볼륨 동작 확인**  

### 3-1. Pod 실행 후 컨테이너 내부에서 볼륨이 정상적으로 마운트되었는지 확인  

```bash
kubectl apply -f host-pod1.yaml
kubectl get po -o wide | grep host-pod1
kubectl exec -it host-pod1 -- bash
```

### 3-2. 마운트된 디렉터리 확인  

```bash
mount | grep mount1
df -h
```

### 3-3. `/mount1` 디렉터리에 파일 생성  

```bash
cd /mount1
echo 'hello k8s host-path' > k8s-2.txt
ls
cat k8s-2.txt
exit
```
---

## **4. NFS 설치 및 연결 방법**  

쿠버네티스에서 **여러 노드에서 공유 가능한 영구적인 스토리지**를 사용하려면 `NFS`(Network File System)를 활용할 수 있다.  

### **NFS 서버 설정**  
### 4-1. **서버에서 NFS 패키지 설치**  

```bash
sudo apt update && sudo apt install -y nfs-kernel-server
```


### 4-2. **내보낼 디렉터리 설정** (`/etc/exports` 파일 수정)  

```bash
sudo vim /etc/exports 
/DATA1 *(rw,sync,no_root_squash,no_subtree_check,insecure)
```

### 4-3. **NFS 서비스 재시작 및 확인**  
```bash
sudo systemctl restart nfs-server
sudo netstat -nlp | grep 2049
```

---

## **5. NFS 볼륨을 가진 Pod 생성**  

NFS를 사용하는 Pod는 아래와 같이 설정할 수 있다.  

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: nfs-nginx
spec:
    volumes:
    - name: nfs-vol
      nfs:
      path: /DATA1
      server: 192.168.56.101
    containers:
    - image: nginx:1.25.3-alpine
      name: nfs-nginx
      volumeMounts:
      - name: nfs-vol
        mountPath: /usr/share/nginx/html
```


NFS 서버의 `/DATA1` 디렉터리에 `index.html` 파일을 생성하면, Nginx가 이를 서빙할 수 있다.  

---

## **6. HostPath 방식에서 Nginx와 MySQL 운용**  

쿠버네티스에서 `hostPath`를 사용하면 **컨테이너의 로그, 데이터베이스 데이터 등이 Pod가 삭제된 후에도 유지**될 수 있다.  

### **Nginx 로그를 HostPath에 저장**  

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: weblog-pod
spec:
    nodeSelector:
      kubernetes.io/hostname: k8s-node1
    volumes:
    - name: host-path
      hostPath:
      path: /DATA1/nginx-log
      type: DirectoryOrCreate
    containers:
    - image: nginx:1.23.3-alpine
      name: nginx-web
      ports:
      - containerPort: 80
      volumeMounts:
      - name: host-path
        mountPath: /var/log/nginx
```

이제 `/DATA1/nginx-log` 디렉터리에 Nginx 로그가 저장된다.

---

## **7. MySQL 데이터를 HostPath에 저장**  

MySQL 데이터가 유지되도록 `hostPath` 볼륨을 활용할 수 있다.  

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: mydata-pod
spec:
    nodeSelector:
    kubernetes.io/hostname: k8s-node1
    volumes:
    - name: host-path
      hostPath:
      path: /DATA1/mysql-data
      type: DirectoryOrCreate
    containers:
    - image: mysql:8.0
      name: mydata-container
      volumeMounts:
      - name: host-path
        mountPath: /var/lib/mysql
      env:
      - name: MYSQL_ROOT_PASSWORD
        value: "password"
``` 

---

## **8. MySQL 데이터 유지 확인**  

### 8-1. MySQL 데이터베이스 생성  

```bash 
mysql -u root -p
CREATE DATABASE k8sdb;
USE k8sdb;
CREATE TABLE k8s (c1 INT, c2 VARCHAR(20));
INSERT INTO k8s VALUES (1, 'k8s'), (2, 'mysql');
SELECT * FROM k8s;
```

### 8-2. 데이터 저장 경로 확인  

```bash
cd /var/lib/mysql
ls
cd k8sdb
ls
```

### 8-3. MySQL Pod 삭제 후 데이터 유지 여부 확인  

```bash
kubectl delete pod mydata-pod
kubectl apply -f mydata-pod.yaml
```

Pod를 다시 실행해도 기존 데이터가 유지된다.

---

## **9. 결론**  

- `hostPath`를 사용하면 **Pod가 삭제되어도 데이터가 유지**되지만, 특정 노드에 의존하므로 유연성이 떨어질 수 있다.  
- `NFS`는 **여러 노드에서 공유 가능한 스토리지**로 활용할 수 있으며, 영구적인 데이터 저장소로 적합하다.  
- `hostPath`를 활용하여 **로그 파일과 MySQL 데이터를 보존할 수 있으며**, 이를 통해 컨테이너가 삭제되더라도 데이터를 유지할 수 있다.  
