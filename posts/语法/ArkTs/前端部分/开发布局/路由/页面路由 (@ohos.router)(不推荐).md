- `router.pushUrl`：目标页面不会替换当前页，而是压入页面栈。这样可以保留当前页的状态，并且可以通过返回键或者调用`router.back`方法返回到当前页。
- `router.replaceUrl`：目标页面会替换当前页，并销毁当前页。这样可以释放当前页的资源，并且无法返回到当前页。
## 引入
```ts
import { promptAction, router } from '@kit.ArkUI';
import { BusinessError } from '@kit.BasicServicesKit';
```
## router.pushUrl
- 压入页面栈
```ts
import { router } from '@kit.ArkUI';


// 在Home页面中
function onJumpClick(): void {
  router.pushUrl({
    url: 'pages/Detail' // 目标url
  }, router.RouterMode.Standard, (err) => {
    if (err) {
      console.error(`Invoke pushUrl failed, code is ${err.code}, message is ${err.message}`);
      return;
    }
    console.info('Invoke pushUrl succeeded.');
  });
}
```
## router.replaceUrl
- 销毁登录页，在返回时直接退出应用
```ts
import { router } from '@kit.ArkUI';


// 在Login页面中
function onJumpClick(): void {
  router.replaceUrl({
    url: 'pages/Profile' // 目标url
  }, router.RouterMode.Standard, (err) => {
    if (err) {
      console.error(`Invoke replaceUrl failed, code is ${err.code}, message is ${err.message}`);
      return;
    }
    console.info('Invoke replaceUrl succeeded.');
  })
}
```
## 传递数据给目标页面
- 通过params属性，并指定一个对象作为参数
```ts
import { router } from '@kit.ArkUI';


class DataModelInfo {
  age: number = 0;
}

class DataModel {
  id: number = 0;
  info: DataModelInfo | null = null;
}

function onJumpClick(): void {
  // 在Home页面中
  let paramsInfo: DataModel = {
    id: 123,
    info: {
      age: 20
    }
  };

  router.pushUrl({
    url: 'pages/Detail', // 目标url
    params: paramsInfo // 添加params属性，传递自定义参数
  }, (err) => {
    if (err) {
      console.error(`Invoke pushUrl failed, code is ${err.code}, message is ${err.message}`);
      return;
    }
    console.info('Invoke pushUrl succeeded.');
  })
}
```
- 在目标页面中，通过调用Router模块的[getParams](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-router#routergetparams)方法来获取传递过来的参数
```ts
import { router } from '@kit.ArkUI';

class InfoTmp {
  age: number = 0;
}

class RouTmp {
  id: object = () => {
  };
  info: InfoTmp = new InfoTmp();
}

const params: RouTmp = router.getParams() as RouTmp; // 获取传递过来的参数对象
const id: object = params.id; // 获取id属性的值
const age: number = params.info.age; // 获取age属性的值
```