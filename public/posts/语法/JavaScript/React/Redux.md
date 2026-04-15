- 集中状态管理工具，可以**独立**于框架运行
- 作用：通过集中管理的方式管理应用的状态

使用步骤：

1. 定义一个reducer函数（根据当前想要做的修改返回一个新的状态）
2. 使用createStore方法传入 reducer函数 生成一个store实例对象
3. 使用store实例的 subscribe方法 订阅数据的变化（数据一旦变化，可以得到通知）
4. 使用store实例的 dispatch方法 提交action对象 触发数据变化（告诉reducer你想怎么改数据）
5. 使用store实例的 getState方法 ·最新的状态数据更新到视图中

```
<button id="decrement">-</button>
<span id="count">0</span>
<button id="increment">+</button>

<script src = "https://unpkg.com/redux@4.2.1/dist/redux.min.js">
  //指向的是 Redux v4.2.1 的压缩版文件（redux.min.js）
  //让网页拥有 Redux 这个库的功能
</script>
<script defer>
  //1.定义reducer函数
  // 作用：根据当前状态和指定的action，返回一个新的状态
  // state: 管理的数据初始状态
  // action: 对象type标记当前想要做什么样的修改
  function reducer(state = { count:0 }, action) {
    if(action.type === 'INCREMENT'){
      return { count: state.count + 1 };
    }
    if(action.type === 'DECREMENT'){
      return { count: state.count - 1 };
    }
    return state;
  }

  //2.使用reducer函数生成store实例
  const store = Redux.createStore(reducer);

  //3.监听store状态的改变
  store.subscribe(() => {
    console.log("state变化了")
    document.getElementById('count').innerText = store.getState().count;
    //从网页上的 HTML 里，找到id 是 count 的那个元素(<span id="count">0</span>)
    //设置这个元素里面的文字内容。
    //比如原来 <span>0</span>，你可以改成 <span>10</span>，只要改 .innerText 就可以了
  })

  //4.通过store.dispatch()方法，派发action，修改store中的状态
  const inBtn = document.getElementById('increment');
  const deBtn = document.getElementById('decrement');

  inBtn.addEventListener('click', () => {
    store.dispatch({ type: 'INCREMENT' });
  });

  deBtn.addEventListener('click', () => {
    store.dispatch({ type: 'DECREMENT' });
  })

  //5.获取store中的状态
</script>
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745675964965-3104e488-ccaa-403f-8f7f-348f6a79902d.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745675972350-308973cc-66d7-48e8-94fe-b71ba90f808f.png)

### 整个动作流程是这样的：

- 你点了按钮 →
- 触发了 `dispatch({ type: 'INCREMENT' })` →
- Redux 自动调用 `reducer(store里面原来的状态, 你派发的action)` →
- `reducer` 看到是 `'INCREMENT'`，返回 `{ count: 原来+1 }` →
- Redux 接到新的 state →
- Redux 仓库自己把这个新 state 存进去。

不需要直接操作仓库  
**只需要写好** `**reducer**` **的返回值，Redux会帮你存好。**