使用next数组记录最长公共子前缀
```cpp fold
#include <iostream>
#include <vector>
#include <string>
using namespace std;

// 得到 next 数组
vector<int> nextArray(const string& s, int m) {
    if (m == 1) return { -1 };
    vector<int> next(m);
    next[0] = -1;
    next[1] = 0;
    int i = 2, cn = 0;
    while (i < m) {
        if (s[i - 1] == s[cn]) {
            next[i++] = ++cn;
        } else if (cn > 0) {
            cn = next[cn];
        } else {
            next[i++] = 0;
        }
    }
    return next;
}

// KMP 主算法
int kmp(const string& s1, const string& s2) {
    int n = s1.length(), m = s2.length();
    if (m == 0) return 0; // 空串匹配
    int x = 0, y = 0;
    vector<int> next = nextArray(s2, m);
    while (x < n && y < m) {
        if (s1[x] == s2[y]) {
            x++;
            y++;
        } else if (y == 0) {
            x++;
        } else {
            y = next[y];
        }
    }
    return y == m ? x - y : -1;
}

// 包装函数，等同于 strStr
int strStr(const string& haystack, const string& needle) {
    return kmp(haystack, needle);
}

// 主函数
int main() {
    string text, pattern;
    getline(cin, text);
    getline(cin, pattern);

    int index = strStr(text, pattern);
    if (index != -1) {
        cout << "Pattern found at index: " << index << endl;
    } else {
        cout << "Pattern not found." << endl;
    }

    return 0;
}
```