### cpp STL
```cpp fold
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
	string s;
	cin.ignore();              // 使用getline前清空输入流
	getline(s);                // 获取带空格的一行
	s.size();                  // 长度
	s[i];                      // 访问
	s.substr(l,len);           // 子串，截取l为首len长度的子串，返回字符串
	s.find("abc");             // 查找，找到返回下标，未找到返回string::npos
	reverse(s.begin(),s.end());// 反转
	sort(s.begin(),s.end());   // 排序
	s.replace(1,2,"xyaaaa");   // 替换1~3字符为xyaaaa，感觉可以代替erase用（）
	string ss = tostring(x);   // int -> string
	int x = stoi(s);           // string -> int
	return 0;
}
```
