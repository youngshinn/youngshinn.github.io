---
layout: single
title:  "Go 연산자 정리"
categories: Go
tag: [Go, Golang]
search: true
---

![go-icon](/assets/images/Go-icon2.png)

# **Golang 연산자 정리**

Go 언어에서는 다양한 **연산자(Operators)** 를 제공하며, 이를 활용하여 변수 간의 연산을 수행할 수 있습니다.  
이번 글에서는 **산술 연산자, 비교 연산자, 논리 연산자, 할당 연산자, 비트 연산자** 등을 정리하겠습니다. 

---

## **1. 산술 연산자 (Arithmetic Operators)**

Go에서 기본적인 **산술 연산자**는 다음과 같습니다.

- `+` : 덧셈  
- `-` : 뺄셈  
- `*` : 곱셈  
- `/` : 나눗셈  
- `%` : 나머지 연산  
- `++` : 값을 1 증가 (단항 연산자)  
- `--` : 값을 1 감소 (단항 연산자)  

### **1.1 기본적인 산술 연산**
```go
package main  
import "fmt"  

func main() {  
    var a, b int = 10, 3  
    fmt.Println("덧셈:", a+b)  
    fmt.Println("뺄셈:", a-b)  
    fmt.Println("곱셈:", a*b)  
    fmt.Println("나눗셈:", a/b)  
    fmt.Println("나머지:", a%b)  
}
```
**출력결과**
```bash  
덧셈: 13  
뺄셈: 7  
곱셈: 30  
나눗셈: 3  
나머지: 1  
```
### **1.2 증가/감소 연산자**
```go
package main  
import "fmt"  

func main() {  
    var i int = 1  
    i++  
    fmt.Println("i 증가:", i)  

    i--  
    fmt.Println("i 감소:", i)  
}
```
**출력결과** 
```bash 
i 증가: 2  
i 감소: 1  
```
---

## **2. 비교 연산자 (Comparison Operators)**

비교 연산자는 두 개의 값을 비교하여 `true` 또는 `false` 값을 반환합니다.

- `==` : 두 값이 같은지 확인  
- `!=` : 두 값이 다른지 확인  
- `<` : 왼쪽 값이 오른쪽 값보다 작은지 확인  
- `<=` : 왼쪽 값이 오른쪽 값보다 작거나 같은지 확인  
- `>` : 왼쪽 값이 오른쪽 값보다 큰지 확인  
- `>=` : 왼쪽 값이 오른쪽 값보다 크거나 같은지 확인  

### **2.1 비교 연산자 예제**
```go
package main  
import "fmt"  

func main() {  
    var x, y int = 10, 20  
    fmt.Println("x == y:", x == y)  
    fmt.Println("x != y:", x != y)  
    fmt.Println("x < y:", x < y)  
    fmt.Println("x <= y:", x <= y)  
    fmt.Println("x > y:", x > y)  
    fmt.Println("x >= y:", x >= y)  
}
```
**출력결과**
```bash  
x == y: false  
x != y: true  
x < y: true  
x <= y: true  
x > y: false  
x >= y: false  
```
---

## **3. 논리 연산자 (Logical Operators)**

논리 연산자는 **불리언 값(Boolean)** 을 조합하여 논리를 결정할 때 사용됩니다.

- `&&` : 두 개의 문장이 모두 `true` 이면 `true`, 아니면 `false`  
- `||` : 두 개의 문장 중 하나라도 `true` 이면 `true`, 아니면 `false`  
- `!` : 단항 연산자로, 결과를 반전 (`true` → `false`, `false` → `true`)  

### **3.1 논리 연산자 예제**
```go
package main  
import "fmt"  

func main() {  
    var x int = 10  
    fmt.Println((x < 100) && (x > 5))  
    fmt.Println((x > 100) || (x > 5))  
    fmt.Println(!(x > 5))  
}
```
**출력결과**
```bash  
true  
true  
false  
```
---

## **4. 할당 연산자 (Assignment Operators)**

할당 연산자는 변수에 값을 할당하는데 사용됩니다.

- `=` : 값 할당  
- `+=` : `x += y` 는 `x = x + y` 와 같음  
- `-=` : `x -= y` 는 `x = x - y` 와 같음  
- `*=` : `x *= y` 는 `x = x * y` 와 같음  
- `/=` : `x /= y` 는 `x = x / y` 와 같음  
- `%=` : `x %= y` 는 `x = x % y` 와 같음  

### **4.1 할당 연산자 예제**
```go
package main  
import "fmt"  

func main() {  
    var x, y int = 10, 20  
    x += y  
    fmt.Println("x += y:", x)  

    x -= y  
    fmt.Println("x -= y:", x)  

    x *= y  
    fmt.Println("x *= y:", x)  

    x /= y  
    fmt.Println("x /= y:", x)  

    x %= y  
    fmt.Println("x %= y:", x)  
}
```
**출력결과**
```bash  
x += y: 30  
x -= y: 10  
x *= y: 200  
x /= y: 10  
x %= y: 10  
```
---

## **5. 비트 연산자 (Bitwise Operators)**

비트 연산자는 **비트 단위로 연산을 수행**합니다.

- `&` : AND 연산  
- `|` : OR 연산  
- `^` : XOR 연산  
- `<<` : 왼쪽 시프트  
- `>>` : 오른쪽 시프트  

### **5.1 비트 AND 연산**
```go
package main  
import "fmt"  

func main() {  
    var x, y int = 12, 25  
    fmt.Println("x & y:", x & y)  
}
```
**출력결과**
```bash  
x & y: 8
```  

### **5.2 비트 OR 연산**
```go
package main  
import "fmt"  

func main() {  
    var x, y int = 12, 25  
    fmt.Println("x | y:", x | y)  
}
```
**출력결과**
```bash  
x | y: 29
```  

### **5.3 비트 XOR 연산**
```go
package main  
import "fmt"  

func main() {  
    var x, y int = 12, 25  
    fmt.Println("x ^ y:", x ^ y)  
}
```
**출력결과**
```bash  
x ^ y: 21  
```
### **5.4 왼쪽 시프트 연산**
```go
package main  
import "fmt"  

func main() {  
    var x int = 212  
    fmt.Println("x << 1:", x << 1)  
}
```
**출력결과**
```bash 
x << 1: 424  
```
### **5.5 오른쪽 시프트 연산**
```go
package main  
import "fmt"  

func main() {  
    var x int = 212  
    fmt.Println("x >> 2:", x >> 2)  
}
```
**출력결과**
```bash  
x >> 2: 53  
```
---

## **6. 결론**

Go 언어에서 **연산자(Operators)** 는 다양한 계산 및 논리 처리를 위해 사용됩니다.  
