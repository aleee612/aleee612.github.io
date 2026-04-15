[P1036 [NOIP 2002 普及组] 选数 - 洛谷](https://www.luogu.com.cn/problem/P1036)
[P10386 [蓝桥杯 2024 省 A] 五子棋对弈 - 洛谷](https://www.luogu.com.cn/problem/P10386)（?）
### dfs：深度优先
一般来说是利用递归
```cpp fold
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// 图的邻接表表示
vector<vector<int>> adj;//二维数组，用来记录无向图
vector<bool> visited; // 记录节点是否访问过

// 深度优先搜索
void dfs(int node) {
    visited[node] = true; // 标记当前节点为已访问
    // 处理当前节点的逻辑（例如，输出当前节点或计算某些值）
    cout << node << " "; // 示例：输出当前节点

    // 遍历与当前节点相邻的所有未访问节点
    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {// 如果邻接节点没有被访问过
            dfs(neighbor); // 则递归遍历邻接节点
        }
    }
}

int main() {
    int n, m;  // n: 节点数，m: 边数
    cin >> n >> m;

    adj.resize(n);//给adj n个节点
    visited.resize(n, false); // 初始化访问状态，都设置成false，访问之后为true

    // 构建图
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v; // 输入边 (u, v)
        adj[u].push_back(v); // 无向图的边：u -> v 和 v -> u
        //对于adj[u]中的来说，他们都是和u有关的（也就是neighbor）
        adj[v].push_back(u);
    }

    // 从节点 0 开始进行 DFS
    dfs(0);
    return 0;
}
```
- 通过adj模拟图中的各个关系
- 通过递归就能够遍历过所有的相邻节点
- 如果该节点已经走过（标记为true）则不再访问
#### 例题部分
1. 子数组和最大问题
![496](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542173168-38cef789-6542-432b-b18a-e9556b36a141.png "null")
![496](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542173282-0ffd1980-e63d-4fe1-a345-2472874be474.png "null")
```cpp fold
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int dfs(vector<int> arr, int i, vector<int>& dp) {
        if (i == arr.size()) {
            return 0;
        }
        if (dp[i] != -1) {
            return dp[i];
        }
        dp[i] = max(arr[i] + dfs(arr, i + 1, dp), dfs(arr, i + 1, dp));
        return dp[i];
    }

    int maxSubArray(vector<int>& arr, int k) {
        int n = arr.size();
        vector<int> dp(n, -1);
        int result = dfs(arr, 0, dp);
        return result;
    }
};

int main() {
    Solution sol;
    vector<int> arr;
    string str;
    getline(cin,str);
    for(int i = 0; i < str.length(); i++)
        if(str[i] != ',')
            arr.push_back(str[i] - '0');
    int k;
    cin >> k;
    cout << sol.maxSubArray(arr, k) << endl;
    return 0;
}
```
重点：`dp[i] = max(arr[i] + dfs(arr, i + 1, dp), dfs(arr, i + 1, dp));`
### bfs：广（宽）度优先
> 核心思想：队列，level（用于表示当前层级），count
1. 使用队列存储头结点，将 `level` 值设为 `0`
2. 将头结点对应的图中上下左右元素未进队列过的从尾端加入队列，并使 `level++`，记录当前队列中元素个数 `count`，即为这一层的元素个数
3. 将当前队列中的元素出队列，该元素的后续元素入队列，直至 `count == 0` 
4. 重复步骤 2, 3，直至整个图被遍历完或找到终点节点的层数
##### 洛谷 p1451
![490](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542173375-6e3d93cf-0943-461d-a803-e54c26616090.png "null")
```cpp fold
#include<iostream>
using namespace std;
struct zuobiao{
    int x,y;
}
q[30000];
bool map[200][200],p[200][200];//图用bool二维数组储存
int n,m,ans;
char a;
int c[4][2]={0,1,1,0,-1,0,0,-1};//数组储存四个方向
void bfs(int x,int y)
{
    ans++;//新的细胞
    int f=0,r=1,X,Y;//f：队首  r：队尾
    q[1].x=x;
    q[1].y=y;
    while(f<r)
    {
        f++;//入队
        X=q[f].x,Y=q[f].y;
        p[X][Y]=1;//标记已走过
        for(int i=0;i<4;i++)//循环四个方向
        {
            int xx=X+c[i][0];
            int yy=Y+c[i][1];
            if(map[xx][yy]&&(!p[xx][yy]))//是数字且没走过
            //（边界以外都为0，所以可以不用判断边界）
            {
                q[++r].x=xx;//加入队尾等待处理
                q[r].y=yy;
            }
        }
    }
}
int main()
{
    cin>>m>>n;
    for(int i=1;i<=m;i++)
    {
        for(int j=1;j<=n;j++)
        {
            cin>>a;
            map[i][j]=(a!='0');//存储到bool数组中
        }
    }
    for(int i=1;i<=m;i++)
    {
        for(int j=1;j<=n;j++)
        {
            if(!p[i][j]&&map[i][j])
            {
                bfs(i,j);//如果没被搜索过且是数字，BFS
            }
        }
    }
    cout << ans;
}
```
#### 扩展：01 bfs
> 核心思想：双端队列，distance数组
> 解决题目类型：仅包含 `0`，`1` 权值的（有向）图
1. `distance[i]` 表示从源点到i点的最短距离，初始时所有点的 `distance` 设置为无穷大
2. 源点进入双端队列，`distance[源点] = 0`
3. 双端队列 **头部** 弹出 x:
	A. 如果x是目标点，返回 `distance[x]` 表示源点到目标点的最短距离
	B. 考察从x出发的每一条边，假设某边去y点，边权为w
		1. 如果 `distance[y]> distance[x] + w`，处理该边;否则忽略该边
		2. 处理时，更新 `distance[y] = distance[x] + w`
			如果 `w == 0`，y从头部进入双端队列。继续重复步骤3
			如果 `w == 1`，y从尾部进入双端队列。继续重复步骤3
4. 双端队列为空停止
#### 双向广搜
##### 1. 对bfs的小优化
1. 题目要求从 `start` 到 `end` ，则在两端分别使用bfs
2. 使用 set 对每个新增的分支节点进行判断，以找出两个bfs形成的树中重复的那个节点，即为对应的最终路径
3. 当一方的当前 `level` 的节点**总数**大于另一方时，对节点数小的那方扩展下一层
##### 2. 实际应用：分冶后归并
1. 当需要暴力遍历的节点数过多时，通过折半分别 bfs 后再合并来解答
2. 左右分别bfs，直至中点 `e` 为止，当当前层数 `j == e` 时，记录当前层的节点，并排序
3. 合并过程：
	1. 使用双指针，分别对应左右两 bfs 所得数组
	2. 左指针指向需判断大小的元素，右指针指向最大可行元素
	3. 由于节点数组已经过排序，故左右指针都不需要回退
### 洪水填充
