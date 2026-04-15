# operator 运算符重载

`operator` 关键字用于重载运算符，让类或结构体可以自定义 `+ - * / ==` 等运算符的行为。

常见用途包括：

1. 重载算术运算符（如 `+`、、）

2. 重载比较运算符（如 `==`、`<`）

3. 重载赋值运算符（如 `=`, `+=`）

4. 重载函数调用运算符（`operator()`，用于仿函数）

5. 重载类型转换运算符（如 `operator int()`）

---

## 1. 重载算术运算符

让 `Vector2D` 类支持 `+` 号：

```cpp

#include <iostream>
using namespace std;

struct Vector2D {
    int x, y;

    // 重载 + 运算符
    Vector2D operator+(const Vector2D& other) const {
        return {x + other.x, y + other.y};
    }
};

int main() {
    Vector2D v1{2, 3}, v2{4, 5};
    Vector2D v3 = v1 + v2;  // 调用 operator+
    cout << v3.x << ", " << v3.y << endl;  // 输出 6, 8
}
```

operator+ 让 v1 + v2 表示向量的相加操作，不需要写成 v1.add(v2)。

---

## 2. 重载比较运算符

```cpp
struct Person {
    int age;

    bool operator<(const Person& other) const {
        return age < other.age;
    }
};

int main() {
    Person p1{25}, p2{30};
    if (p1 < p2) cout << "p1 比 p2 年轻\n";
}
```

operator< 让 p1 < p2 表示 p1.age < p2.age。

---

## 3. 重载赋值运算符

```cpp
struct Counter {
    int value;

    Counter& operator=(const Counter& other) {
        value = other.value;
        return *this;  // 支持连锁赋值：a = b = c;
    }
};
```

---

## 4. 重载 `operator()`（仿函数）

```cpp
struct Multiply {
    int operator()(int x, int y) const {
        return x * y;
    }
};

int main() {
    Multiply mul;
    cout << mul(3, 4) << endl;  // 输出 12
}
```

operator() 让 Multiply 实例像函数一样被调用。

---

## 5. 重载类型转换运算符

```cpp
struct Number {
    int value;

    operator int() const {
        return value;
    }
};

int main() {
    Number n{42};
    int x = n;  // 隐式调用 operator int()
    cout << x << endl;  // 输出 42
}
```

operator int() 让 Number 类型能自动转换为 int 类型。