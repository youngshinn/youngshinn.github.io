---
layout: single
title:  "Go 언어 문자 타입 정리"
categories: Go
tag: [Go, Golang]
search: true
---
![go-icon](/assets/images/Go-icon2.png)

## **Go 언어 문자 타입 (rune, byte, string)**

Go 언어에서는 문자를 다루는 다양한 타입이 존재합니다. 일반적으로 `string` 타입을 사용하여 문자열을 표현하지만, Go는 `rune`과 `byte` 타입을 활용하여 문자의 표현과 처리를 보다 세밀하게 할 수 있습니다. 

## **1. 문자열(string) 타입**

Go의 `string` 타입은 불변(immutable)한 바이트 시퀀스로, UTF-8 인코딩을 기본적으로 따릅니다. 즉, 문자열 내부적으로 바이트 배열로 저장됩니다.

```GO
package main
import "fmt"

func main() {
    str := "Go 언어"
    fmt.Println("문자열:", str) 
}
```
출력 결과
```bash
문자열: Go 언어
```

## **2. 바이트(byte) 타입**

Go에서 `byte`는 `uint8의 별칭(alias)`이며, 문자열의 개별 문자를 ASCII 코드(혹은 UTF-8의 단일 바이트)로 다룰 때 사용됩니다.

```GO
package main
import "fmt"

func main() {
    str := "Go"
    var b byte = str[0] 
    fmt.Println("첫 번째 문자의 바이트 값:", b)
    fmt.Printf("첫 번째 문자: %c\n", b)
}
```
출력 결과
```bash
첫 번째 문자의 바이트 값: 71
첫 번째 문자: G
```

## **3. 룬(rune) 타입**
Go에서 `rune`은 `int32`의 별칭이며, UTF-8에서 하나의 문자를 표현하는 데 사용됩니다. 다국어 문자(예: 한글, 한자)를 다룰 때 rune을 활용하면 올바르게 처리할 수 있습니다.

```GO
package main
import "fmt"

func main() {
    str := "안녕하세요"
    runes := []rune(str) 
    fmt.Println("rune 슬라이스:", runes) 
    fmt.Printf("첫 번째 문자: %c\n", runes[0])
}
```
출력 결과
```bash
rune 슬라이스: [50504 45397 54616 49464 50836]
첫 번째 문자: 안
```

## **4. 문자열의 문자 추출**
Go에서는 `string[index]`로 문자를 가져올 수 있지만, 한글처럼 UTF-8에서 1바이트 이상을 차지하는 문자는 깨질 수 있습니다. 이를 해결하려면 `rune` 타입으로 변환해야 합니다.

```GO
package main
import "fmt"

func main() {
    str1 := "GoLang"
    str3 := "고프로그래밍"

    fmt.Println("ASCII 문자:", str1[0], str1[1], str1[2]) 
    fmt.Println("한글 깨짐:", str3[0], str3[1], str3[2]) 
    
    conStr := []rune(str3) 
    fmt.Println("한글 정상 출력:", string(conStr[0]), string(conStr[1]), string(conStr[2]))
}
```
출력 결과
```bash
ASCII 문자: 71 111 76
한글 깨짐: 234 179 160
한글 정상 출력: 고 프 로
```

## **5. 문자열 연산**
### **5.1 문자열 비교 (ASCII 코드 기반 비교)**
Go에서 문자열 비교는 ASCII 코드 값을 기반으로 이루어집니다. 즉, 문자열의 각 문자에 해당하는 **ASCII 값을 비교하여 대소 관계**를 판별합니다.

```go
package main
import "fmt"

func main() {
    str1 := "Golang"
    str2 := "World"

    fmt.Println("같은가?:", str1 == str2) 
    fmt.Println("다른가?:", str1 != str2) 
    fmt.Println("사전식 비교:", str1 > str2) 
}
```
출력 결과
```bash
같은가?: false
다른가?: true
사전식 비교: true
```

## **6. 문자열 결합 (`+` 연산 vs `strings.Join`)**

Go에서는 문자열을 `+` 연산자로 연결하거나 `strings.Join()`을 사용할 수 있습니다. 일반적으로 여러 개의 문자열을 효율적으로 결합할 때 `strings.Join()`을 선호합니다.
```go
package main
import (
    "fmt"
    "strings"
)

func main() {
    str1 := "The Go programming language is fast and efficient. "
    str2 := "It is used for backend development and cloud computing."

    fmt.Println("문자열 결합:", str1+str2)
    
    strSlice := []string{str1, str2}
    fmt.Println("strings.Join() 사용:", strings.Join(strSlice, " | "))
}
``` 
출력 결과
```bash
문자열 결합: The Go programming language is fast and efficient. It is used for backend development and cloud computing.
strings.Join() 사용: The Go programming language is fast and efficient. | It is used for backend development and cloud computing.
``` 

### **`strings.Join()`을 더 많이 사용하는 이유**
* `+` 연산자는 새로운 문자열을 매번 생성하여 성능이 저하될 수 있습니다.

* `strings.Join()`은 내부적으로 효율적인 버퍼를 사용하여 여러 개의 문자열을 결합하므로 성능이 뛰어납니다.

* 특히 for 루프 내에서 문자열을 결합할 때 `strings.Join()`을 사용하면 메모리 사용량을 줄이고 속도를 향상시킬 수 있습니다.