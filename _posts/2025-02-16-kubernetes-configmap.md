---
layout: single
title: "Kubernetes ConfigMap 사용법 및 활용"
categories: Kubernetes
tag: [Kubernetes, ConfigMap, DevOps]
search: true
---

## Kubernetes ConfigMap 사용법 및 활용

`ConfigMap`은 Kubernetes에서 환경 변수를 관리하기 위한 중요한 리소스 중 하나이다.
애플리케이션의 설정 값을 코드와 분리하여 운영할 수 있으며, Pod에서 다양한 방식으로 적용할 수 있다.

## 1. ConfigMap이란?

Kubernetes에서 `ConfigMap`은 설정 데이터를 저장하는 오브젝트로,
애플리케이션이 실행될 때 환경 변수나 설정 파일을 통해 값을 주입할 수 있도록 해준다.

### ConfigMap의 주요 특징
- Key-Value 형태로 데이터 저장
- 컨테이너 이미지와 설정을 분리하여 관리 가능
- 환경 변수, 설정 파일, 커맨드라인 인수 등 다양한 방식으로 Pod에 적용 가능
- 여러 Pod에서 동일한 설정 값을 공유할 수 있음

## 2. Docker 환경 변수 vs Kubernetes ConfigMap

일반적으로 Docker에서는 실행 시 `-e` 옵션을 사용하여 환경 변수를 설정한다.

```bash
docker run -e API_KEY=hello myapp
```
반면 Kubernetes에서는 `ConfigMap`을 통해 환경 변수를 중앙에서 관리하고 여러 Pod에서 공유할 수 있다.

| 구분 | Docker 환경 변수 | Kubernetes ConfigMap |
|------|-----------------|----------------------|
| 설정 방식 | -e 옵션 사용 | ConfigMap 리소스 생성 후 Pod에 적용 |
| 변경 가능 여부 | 컨테이너 재시작 필요 | 변경 후 즉시 적용 가능 (일부 경우 Pod 재시작 필요) |
| 보안성 | 단순 텍스트 저장 | Secret과 함께 사용 가능 |
| 적용 범위 | 특정 컨테이너에 적용 | 여러 Pod에서 공유 가능 |

## 3. ConfigMap 생성 방법

### 3.1 --from-literal 방식 (직접 Key-Value 입력)

```bash
kubectl create configmap api-key --from-literal=API_KEY=hello
```
### 생성 확인

```bash
kubectl get cm
kubectl describe cm api-key
```
출력 결과:

```bash
Name: api-key
Namespace: default
Data
API_KEY: hello
```
### 3.2 --from-file 방식 (파일을 ConfigMap으로 변환)

```bash
echo "API_KEY=hello" > config.env
kubectl create configmap api-key-file --from-file=config.env
```
### 생성 확인
```bash
kubectl describe cm api-key-file
```
출력 결과:
```bash
Name: api-key-file
Namespace: default
Data
config.env: API_KEY=hello
```
### 3.3 Volume Mount 방식 (설정 파일을 컨테이너에 마운트)

Pod에서 ConfigMap을 파일로 마운트하여 사용할 수도 있다.
```yaml
apiVersion: v1
kind: Pod
metadata:
name: cm-volume-pod
spec:
containers:
- name: cm-volume-pod
image: nginx:1.25.3-alpine
volumeMounts:
- name: cm-volume
mountPath: "/etc/config"
volumes:
- name: cm-volume
configMap:
name: k8s-env
```
### Pod 내부에서 확인
```bash
kubectl exec cm-volume-pod -- ls -al /etc/config
kubectl exec cm-volume-pod -- cat /etc/config/orchestrator
kubectl exec cm-volume-pod -- cat /etc/config/runtime
```
출력 결과:
```bash
kubernetes
containerd
```
## 4. ConfigMap을 Pod에 적용하는 방법

### 4.1 환경 변수 등록 (envFrom)

ConfigMap을 Pod 내부에서 환경 변수로 등록할 수 있다.
```yaml
apiVersion: v1
kind: Pod
metadata:
name: cm-envfrom-pod
spec:
containers:
- name: cm-envfrom-pod
image: nginx:1.25.3-alpine
envFrom:
- configMapRef:
name: k8s-env
```
### 환경 변수 값 확인
```bash
kubectl exec -it cm-envfrom-pod -- env | grep orchestrator
kubectl exec -it cm-envfrom-pod -- env | grep runtime
```
출력 결과:
```bash
orchestrator=kubernetes
runtime=containerd
```
## 5. ConfigMap 활용 정리

### Pod 환경 구성 과정
업로드한 이미지와 같이, ConfigMap을 Pod에 적용하는 과정은 다음과 같다:
```bash
ConfigMap 생성
kubectl create configmap api-key --from-literal=API_KEY=k8spass#
Pod 설정 (envFrom)
YAML 파일에서 configMapRef를 사용하여 Pod 환경 변수 적용.
Node.js 앱에서 환경 변수 사용
process.env.API_KEY를 통해 환경 변수 접근.
출력 결과 확인
API_KEY가 올바르게 설정되었는지 확인.
없는 경우 "noKey → API_KEY is not ~", 있는 경우 "yesKey → Welcome to ~" 메시지 출력.
```
## 6. 결론

- ConfigMap을 활용하면 Kubernetes에서 환경 변수를 체계적으로 관리할 수 있다.
- 환경 변수 등록(envFrom)과 볼륨 마운트(volumeMounts) 방식을 지원한다.
- Docker 환경 변수 설정보다 유연하며, 여러 Pod에서 공유할 수 있다.