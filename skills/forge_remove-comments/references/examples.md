# 代码注释删除示例

本文档提供不同语言代码注释删除的示例，展示删除前后的对比。

---

## Python 注释删除示例

### 示例1：基础注释删除
```python
# 原始代码
def greet(name):
    # 打印问候语
    print(f"Hello, {name}!")  # 输出

# 处理后
def greet(name):
    print(f"Hello, {name}!")
```

### 示例2：多行注释删除
```python
# 原始代码
def calculate_sum(numbers):
    """
    计算列表中所有数字的和
    """
    total = 0
    for num in numbers:
        # 累加每个数字
        total += num
    return total

# 处理后
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
```

---

## JavaScript 注释删除示例

### 示例1：单行和多行注释
```javascript
// 原始代码
function sum(a, b) {
    /* 计算两数之和 */
    return a + b; // 返回结果
}

// 处理后
function sum(a, b) {
    return a + b;
}
```

### 示例2：复杂场景
```javascript
// 原始代码
const api = {
    baseUrl: "http://api.example.com", // 注意：URL 中的 // 不应被删除
    timeout: 5000,  // 超时时间
    /* 配置对象 */
};

function fetchData() {
    // 获取数据
    return fetch(api.baseUrl)
        .then(res => res.json());
}

// 处理后
const api = {
    baseUrl: "http://api.example.com",
    timeout: 5000,
};

function fetchData() {
    return fetch(api.baseUrl)
        .then(res => res.json());
}
```

---

## TypeScript 注释删除示例

```typescript
// 原始代码
interface User {
    name: string; // 用户名
    age: number;  /* 年龄 */
    email: string; // 邮箱
}

const user: User = { 
    name: "Alice", 
    age: 25,
    email: "alice@example.com"
};

// 处理后
interface User {
    name: string;
    age: number;
    email: string;
}

const user: User = { 
    name: "Alice", 
    age: 25,
    email: "alice@example.com"
};
```

---

## TSX 注释删除示例

### 示例1：JSX 注释
```tsx
// 原始代码
function App() {
    /* 组件定义 */
    return (
        <div>
            {/* JSX 注释 */}
            <h1>Hello</h1> {/* 标题 */}
        </div>
    );
}

// 处理后
function App() {
    return (
        <div>
            <h1>Hello</h1>
        </div>
    );
}
```

### 示例2：复杂 TSX 组件
```tsx
// 原始代码
import React from 'react';

interface Props {
    title: string; // 标题
    content: string; /* 内容 */
}

const Card: React.FC<Props> = ({ title, content }) => {
    return (
        <div className="card">
            <h2>{title}</h2> {/* 显示标题 */}
            <p>{content}</p> {/* 显示内容 */}
        </div>
    );
};

export default Card;

// 处理后
import React from 'react';

interface Props {
    title: string;
    content: string;
}

const Card: React.FC<Props> = ({ title, content }) => {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>{content}</p>
        </div>
    );
};

export default Card;
```

---

## C++ 注释删除示例

### 示例1：基础注释
```cpp
// 原始代码
#include <iostream>
using namespace std;

// 主函数
int main() {
    cout << "Hello" << endl; // 输出
    return 0;
}

// 处理后
#include <iostream>
using namespace std;

int main() {
    cout << "Hello" << endl;
    return 0;
}
```

### 示例2：多行注释和代码注释
```cpp
// 原始代码
#include <vector>
using namespace std;

/*
 * 计算斐波那契数列
 */
vector<int> fibonacci(int n) {
    vector<int> result;
    int a = 0, b = 1;
    
    for (int i = 0; i < n; i++) {
        result.push_back(a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    
    return result;
}

// 处理后
#include <vector>
using namespace std;

vector<int> fibonacci(int n) {
    vector<int> result;
    int a = 0, b = 1;
    
    for (int i = 0; i < n; i++) {
        result.push_back(a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    
    return result;
}
```

---

## Java 注释删除示例

```java
// 原始代码
public class Calculator {
    // 加法方法
    public int add(int a, int b) {
        /* 返回两数之和 */
        return a + b;
    }
    
    // 减法方法
    public int subtract(int a, int b) {
        return a - b; // 返回差值
    }
}

// 处理后
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public int subtract(int a, int b) {
        return a - b;
    }
}
```

---

## Go 注释删除示例

```go
// 原始代码
package main

import "fmt"

// 主函数
func main() {
    // 打印消息
    message := "Hello, World!"
    fmt.Println(message) /* 输出到控制台 */
}

// 处理后
package main

import "fmt"

func main() {
    message := "Hello, World!"
    fmt.Println(message)
}
```

---

## HTML/XML 注释删除示例

### HTML 注释
```html
<!-- 原始代码 -->
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
    <!-- 这是头部 -->
</head>
<body>
    <!-- 页面内容 -->
    <h1>Hello World</h1>
    <!-- 注释段落 -->
    <p>Welcome to my site.</p>
</body>
</html>

<!-- 处理后 -->
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>Welcome to my site.</p>
</body>
</html>
```

### XML 注释
```xml
<!-- 原始代码 -->
<root>
    <!-- 配置项 -->
    <config>
        <name>App</name>
        <!-- 版本号 -->
        <version>1.0.0</version>
    </config>
</root>

<!-- 处理后 -->
<root>
    <config>
        <name>App</name>
        <version>1.0.0</version>
    </config>
</root>
```

---

## 注意事项

1. **字符串保护**：所有示例中，字符串内的注释符号都被正确保护（如 URL `http://`）
2. **格式保持**：删除注释后，代码的缩进和结构保持不变
3. **逻辑完整**：注释删除不影响代码的执行逻辑
4. **人工验证**：复杂场景建议人工验证删除结果
