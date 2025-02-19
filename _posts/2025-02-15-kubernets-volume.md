---
layout: single
title:  "Kubernetes Volume 개념과 활용"
categories: Kubernetes
tag: [Kubernetes, DevOps]

search: true
---

## **1. Kubernetes Volume이란?**

쿠버네티스에서 **Pod는 일시적인 존재**이며, 컨테이너가 삭제되거나 재시작될 때 내부 데이터는 사라진다. 이를 해결하기 위해 **Kubernetes Volume**을 사용한다.

### **Kubernetes Volume을 사용하는 이유**
- **데이터 영속성 보장**: 컨테이너가 종료되어도 데이터 유지 가능
- **Pod 내 여러 컨테이너 간 데이터 공유**: 동일한 Pod 내에서 데이터 공유 가능
- **다양한 스토리지 백엔드 지원**: NFS, Persistent Volume, Cloud Storage 등 다양한 옵션 제공

---

## **2. Kubernetes Volume 유형 및 사용법**

쿠버네티스에서는 여러 가지 Volume을 제공하며, 대표적인 유형은 다음과 같다.

- **임시 볼륨(Temporary Volumes)**: Pod가 삭제되면 데이터가 함께 삭제되는 볼륨.
- **영구 볼륨(Persistent Volumes)**: Pod가 삭제되어도 데이터가 유지되는 볼륨.

### **2-1. emptyDir**
Pod가 생성될 때 **빈 디렉터리**가 제공되며, Pod가 삭제될 때 데이터도 함께 삭제됨.  
임시 데이터 저장, 캐싱 용도로 사용.

- Pod 내부의 특정 경로에 emptyDir을 마운트하여 사용할 수 있음.
- Pod가 삭제되면 해당 디렉터리도 함께 삭제됨.
(https://youngshinn.github.io/categories/)
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-example
spec:
  containers:
  - name: app
    image: busybox
    command: [ "sleep", "3600" ]
    volumeMounts:
    - mountPath: "/data"
      name: cache-volume
  volumes:
  - name: cache-volume
    emptyDir: {}
```
---

### **2-2. hostPath**
노드의 특정 디렉터리를 컨테이너에 마운트.  
**단점:** Pod가 다른 노드로 이동하면 데이터를 유지할 수 없음.

- 특정 노드의 디렉터리를 컨테이너 내부의 경로로 마운트하여 사용.
- 노드 내에서 실행되는 Pod는 이 디렉터리를 공유할 수 있지만, 다른 노드에서 실행되는 Pod는 접근할 수 없음.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-example
spec:
  containers:
  - name: app
    image: busybox
    command: [ "sleep", "3600" ]
    volumeMounts:
    - mountPath: "/data"
      name: local-storage
  volumes:
  - name: local-storage
    hostPath:
      path: "/mnt/data"
      type: DirectoryOrCreate
```
---

### **2-3. Persistent Volume (PV) & Persistent Volume Claim (PVC)**
- **PV (Persistent Volume)**: 클러스터의 독립적인 스토리지 리소스
- **PVC (Persistent Volume Claim)**: Pod에서 PV를 요청하는 방식
- 데이터가 유지되며 **재사용 가능**, 클러스터 내 여러 Pod에서 사용 가능

#### **PersistentVolume (PV) 생성**
- 클러스터에서 일정한 크기의 스토리지를 사전에 할당하는 개념.
- 일반적으로 클라우드 스토리지, NFS, Ceph 등을 활용하여 데이터를 저장.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-example
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: "/mnt/data"
```
#### **PersistentVolumeClaim (PVC) 생성**
- Pod가 필요한 스토리지를 요청하는 방식.
- PVC가 PV를 할당받으면, 해당 Pod는 데이터를 영구적으로 저장할 수 있음.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-example
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
```
#### **PVC를 사용하는 Pod**
- Pod에서 PVC를 참조하여 데이터를 저장하고 사용.
- Pod가 재시작되더라도 PVC를 통해 데이터가 유지됨.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  containers:
  - name: app
    image: busybox
    command: [ "sleep", "3600" ]
    volumeMounts:
    - mountPath: "/data"
      name: persistent-storage
  volumes:
  - name: persistent-storage
    persistentVolumeClaim:
      claimName: pvc-example
```
---

### **2-4. NFS (Network File System)**
- 여러 Pod에서 데이터를 공유하기 위해 **네트워크 스토리지**를 사용.
- 클러스터 내부 또는 외부에 있는 NFS 서버와 연결하여 데이터를 저장.
- 데이터가 유지되며, 여러 Pod가 동시에 접근할 수 있음.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteMany
  nfs:
    path: /var/nfs
    server: 192.168.1.100
```
---

## **3. Kubernetes Volume 정리**

| Volume 유형  | 특징  | 데이터 유지 여부  | 주요 활용 |
|-------------|------|--------------|------------|
| emptyDir | Pod가 실행될 때 생성됨 | Pod 삭제 시 삭제 | 임시 저장소, 캐싱 |
| hostPath | 노드의 로컬 디렉터리 사용 | 노드 삭제 시 삭제 | 로컬 데이터 저장 |
| PersistentVolume (PV) | 독립적인 스토리지 제공 | 유지 가능 | 장기 데이터 저장 |
| NFS | 네트워크 파일 공유 | 유지 가능 | 여러 Pod 간 데이터 공유 |

---
