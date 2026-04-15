p2563背包
### 由递归到一维
```cpp title="一维dp" fold
#include <iostream>
#include <vector>
#include <cstring>
using namespace std;

// 递归版本
int fib1(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    return fib1(n - 1) + fib1(n - 2);
}

// 记忆化递归版本
int fib2(int n) {
    vector<int> dp(n + 1, -1);
    return fib2Helper(n, dp);
}

int fib2Helper(int n, vector<int>& dp) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    if (dp[n] != -1) return dp[n]; // 如果当前已经被算过了就直接返回
    dp[n] = fib2Helper(n - 1, dp) + fib2Helper(n - 2, dp);
    return dp[n];
}

// 动态规划版本
int fib3(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    vector<int> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2]; //从前往后遍历，存储中间结果
    }
    return dp[n];
}

// 空间优化版本
int fib4(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    int lastLast = 0, last = 1;
    for (int i = 2; i <= n; i++) {
        int cur = lastLast + last;
        lastLast = last;
        last = cur;
    }
    return last;
}

int main() {
    int n;
    cout << "Enter a number: ";
    cin >> n;

    cout << "fib1: " << fib1(n) << endl;
    cout << "fib2: " << fib2(n) << endl;
    cout << "fib3: " << fib3(n) << endl;
    cout << "fib4: " << fib4(n) << endl;

    return 0;
}
```
**核心思想：**
1. 其实 dp 可以看做是带条件的前缀和
2. 主要是通过对重复计算结果的存储而节省时间，即空间换时间
3. 通常使用一张dp数组记录每个节点数据
4. 对于条件：更像是二叉树，分支为满足某一特定条件和不满足条件
#### 最长递增子序列
**核心思想：**
1. 令`dp[0]`为1，代表当前子序列中有一个元素
2. 通过维护dp数组，记录当前元素 左侧&小于其数值 的元素中，对应的dp表中的最大值（即使当前子序列为最长）
3. 最终选择dp中的最大值作为结果
**最优解：**
4. 新增`ends`数组，记录当前最优子数组值
5. 当遍历到的数值大于ends中末尾元素，则将该元素放在ends的末尾+1位置
6. 当小于末尾元素，则将其插入ends表中，并覆盖刚好比其大的元素
7. dp中的数值为在ends中该元素连同自己在内往左总共有几个数
8. 即通过ends数组，省去了对dp前缀中求最大值的步骤，使时间复杂压缩
### 二维
```cpp title=二维 fold
#include <iostream>
#include <vector>
#include <climits>

using namespace std;

// 暴力递归
int f1(const vector<vector<int>>& grid, int i, int j) {
    if (i == 0 && j == 0) return grid[0][0];

    int up = INT_MAX, left = INT_MAX;
    if (i - 1 >= 0) up = f1(grid, i - 1, j);
    if (j - 1 >= 0) left = f1(grid, i, j - 1);

    return grid[i][j] + min(up, left);
}
int minPathSum1(const vector<vector<int>>& grid) {
    return f1(grid, grid.size() - 1, grid[0].size() - 1);
}

// [[记忆化搜索]]
int f2(const vector<vector<int>>& grid, int i, int j, vector<vector<int>>& dp) {
    if (dp[i][j] != -1) return dp[i][j];

    int ans;
    if (i == 0 && j == 0) {
        ans = grid[0][0];
    } else {
        int up = INT_MAX, left = INT_MAX;
        if (i - 1 >= 0) up = f2(grid, i - 1, j, dp);
        if (j - 1 >= 0) left = f2(grid, i, j - 1, dp);
        ans = grid[i][j] + min(up, left);
    }
    dp[i][j] = ans;
    return ans;
}
int minPathSum2(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dp(n, vector<int>(m, -1));
    return f2(grid, n - 1, m - 1, dp);
}

// 动态规划
int minPathSum3(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dp(n, vector<int>(m, 0));
    dp[0][0] = grid[0][0];
    
    for (int i = 1; i < n; i++) 
	    dp[i][0] = dp[i - 1][0] + grid[i][0];
    for (int j = 1; j < m; j++) 
	    dp[0][j] = dp[0][j - 1] + grid[0][j];

    for (int i = 1; i < n; i++) {
        for (int j = 1; j < m; j++) {
            dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
        }
    }
    return dp[n - 1][m - 1];
}

// 动态规划 + 空间压缩
int minPathSum4(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<int> dp(m, 0);
    dp[0] = grid[0][0];
    for (int j = 1; j < m; j++) {
        dp[j] = dp[j - 1] + grid[0][j];
    }

    for (int i = 1; i < n; i++) {
        dp[0] += grid[i][0];
        for (int j = 1; j < m; j++) {
            dp[j] = min(dp[j - 1], dp[j]) + grid[i][j];
        }
    }

    return dp[m - 1];
}

int main() {
    vector<vector<int>> grid = {
        {1, 3, 1},
        {1, 5, 1},
        {4, 2, 1}
    };

    cout << "暴力递归结果: " << minPathSum1(grid) << endl;
    cout << "记忆化搜索结果: " << minPathSum2(grid) << endl;
    cout << "动态规划结果: " << minPathSum3(grid) << endl;
    cout << "动态规划 + 空间压缩结果: " << minPathSum4(grid) << endl;

    return 0;
}
```
**核心思想：**
1. 和一维差不多
### 三维
```cpp title=三维 fold
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

// 暴力递归
int f1(const vector<vector<int>>& grid, int i, int j) {
    if (i == 0 && j == 0) return grid[0][0];
    int up = INT_MAX, left = INT_MAX;
    if (i - 1 >= 0) up = f1(grid, i - 1, j);
    if (j - 1 >= 0) left = f1(grid, i, j - 1);
    return grid[i][j] + min(up, left);
}

int minPathSum1(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    return f1(grid, n - 1, m - 1);
}

// [[记忆化搜索]]
int f2(const vector<vector<int>>& grid, int i, int j, vector<vector<int>>& dp) {
    if (dp[i][j] != -1) return dp[i][j];
    int ans;
    if (i == 0 && j == 0) {
        ans = grid[0][0];
    } else {
        int up = INT_MAX, left = INT_MAX;
        if (i - 1 >= 0) up = f2(grid, i - 1, j, dp);
        if (j - 1 >= 0) left = f2(grid, i, j - 1, dp);
        ans = grid[i][j] + min(up, left);
    }
    dp[i][j] = ans;
    return ans;
}

int minPathSum2(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dp(n, vector<int>(m, -1));
    return f2(grid, n - 1, m - 1, dp);
}

// 严格位置依赖的动态规划
int minPathSum3(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dp(n, vector<int>(m, 0));
    dp[0][0] = grid[0][0];
    for (int i = 1; i < n; ++i)
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    for (int j = 1; j < m; ++j)
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    for (int i = 1; i < n; ++i)
        for (int j = 1; j < m; ++j)
            dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
    return dp[n - 1][m - 1];
}

// 空间压缩动态规划
int minPathSum4(const vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<int> dp(m);
    dp[0] = grid[0][0];
    for (int j = 1; j < m; ++j)
        dp[j] = dp[j - 1] + grid[0][j];
    for (int i = 1; i < n; ++i) {
        dp[0] += grid[i][0];
        for (int j = 1; j < m; ++j)
            dp[j] = min(dp[j - 1], dp[j]) + grid[i][j];
    }
    return dp[m - 1];
}

int main() {
    vector<vector<int>> grid = {
        {1, 3, 1},
        {1, 5, 1},
        {4, 2, 1}
    };

    cout << "minPathSum1 (暴力递归): " << minPathSum1(grid) << endl;
    cout << "minPathSum2 (记忆化搜索): " << minPathSum2(grid) << endl;
    cout << "minPathSum3 (二维DP): " << minPathSum3(grid) << endl;
    cout << "minPathSum4 (一维DP): " << minPathSum4(grid) << endl;

    return 0;
}
```

### 最大子数组累加和
**核心思想：**
1. dp构建：以每个元素结尾的情况下，其最大累加和为多少
2. 求最大累加问题：判断当前元素`i`是否加上上一个元素的最大累加和
	1. 若`dp[i-1] <= 0`，则不加，当前`dp[i]`为元素本身
	2. 相反则`dp[i]=dp[i-1]+arr[i]`
3. 取dp最大值为最大子数组累加和
#### 循环数组问题
##### 可邻居
**核心思想：**
1. 分为是否包含`arr[0]`和`arr[n-1]`，以及不包含两种情况
2. 若包含，则反求最小子数组累加和，并用总累加和与之相减
3. 若不包含，则按经典方法做
4. 在最后进行情况讨论，当最小子数组累加和与总累加和相等（如全负），则仅选用操作3的结果
##### 非邻居
**核心思想：**
1. 当`arr[0]`被选择时，则`arr[n-1]`必定不会被选择
2. 因此可以分为`arr[0]`~`arr[n-2]`，`arr[1]`~`arr[n-1]`两种情况取最大值
#### 二维统计问题
**核心思想：**
1. 使用差分思想，分别计算行0~1,0~2,...,0~n,...,n-1~n的每个元素的累加和
2. 在压缩数组中做最大子数组累加和计算