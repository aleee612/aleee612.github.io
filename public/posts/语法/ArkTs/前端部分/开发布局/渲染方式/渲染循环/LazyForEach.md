## 基本语法

```
LazyForEach(
  dataSource: IDataSource,             // 数据源
  itemGenerator: (item: any) => void,  // 子项生成器
  keyGenerator?: (item: any) => string // 可选键生成器
)
```

## 使用步骤

1. **实现 IDataSource 接口**：

需要创建一个类实现 IDataSource 接口，包含以下方法：

- `**totalCount()**`: 返回数据项总数
- `**getData(index: number)**`: 获取指定索引的数据
- `**registerDataChangeListener(listener: DataChangeListener)**`: 注册数据变化监听
- `**unregisterDataChangeListener(listener: DataChangeListener)**`: 取消注册

```
class MyDataSource implements IDataSource {
  private dataArray: string[] = ['Item 1', 'Item 2', 'Item 3'];
  private listeners: DataChangeListener[] = [];

  totalCount(): number {
    return this.dataArray.length;
  }

  getData(index: number): string {
    return this.dataArray[index];
  }

  registerDataChangeListener(listener: DataChangeListener): void {
    this.listeners.push(listener);
  }

  unregisterDataChangeListener(listener: DataChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }
}
@Entry
@Component
struct LazyForEach_use {
  private data: MyDataSource = new MyDataSource();

  build() {
    Column() {
      List() {
        LazyForEach(
          this.data,//数据源
          (item: string) => {
            ListItem() {
              Text(item)
                .fontSize(20)
                .margin({ top: 10, bottfom: 10 })
            }
          },
          (item: string) => item // 使用数据项本身作为key
        )
      }
    }
  }
}
```

## LazyForEach 要求数据源必须是一个实现了 `IDataSource` 接口的 class，而不是普通对象或数组

### 1. 状态管理需求

LazyForEach 需要能够：

- 跟踪数据变化（增删改）
- 通知组件重新渲染
- 维护数据的一致性

这些功能需要一个具有完整生命周期和状态管理能力的 class 来实现，普通对象或数组无法满足这些需求。

### 2. 接口契约要求

`IDataSource` 接口定义了四个必须实现的方法：

```
interface IDataSource {
  totalCount(): number;
  getData(index: number): any;
  registerDataChangeListener(listener: DataChangeListener): void;
  unregisterDataChangeListener(listener: DataChangeListener): void;
}
```

只有 class 才能完整实现这样的接口契约，普通对象无法保证这些方法的完整实现。

## 3. 监听器模式实现

LazyForEach 使用观察者模式监听数据变化：

```
private listeners: DataChangeListener[] = [];

registerDataChangeListener(listener: DataChangeListener): void {
  this.listeners.push(listener);
}
```

这种模式需要 class 来维护监听器列表和实现通知机制。