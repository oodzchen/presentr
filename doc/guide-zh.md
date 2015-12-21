## 使用方法
HTML 结构如下：

```html
<div id="presentr">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
```

使用 Presentr 函数如下：

```javascript
var presentr = Presentr(document.querySelector('#presentr'));
```

## 配置项
Presentr 函数的第二个参数是一个 JavaScript 对象，用于配置各项参数：

  - **width** Number *(默认: 容器的`offsetWidth`)* 演示稿的宽度
  - **height** Number *(默认: 容器的`offsetHeight`)* 演示稿的高度
  - **startIndex** Number *(默认: 0)* 初始位置的索引
  - **cycle** Boolean *(默认: false)* 是否循环切换
  - **speed** Number *(默认: 300)* 动画速度
  - **lock** String/Boolean *(默认: false)* 阻止手势操作（鼠标/Touch事件）， `'left'` 阻止向左的手势， `'right'` 阻止向右的手势， `true` 和 `'both'` 同时阻止左边和右边的手势.
  - **timingFunction** String *(默认: 'ease')* 同 `transition-timing-function`
  - **effect** String *(默认: 'slide')* 动画效果， `'none'`表示无动画， `'fade'`表示渐隐渐现，`'slide'`表示滑动
  - **activeClassName** String *(默认: 'presentr-active')* 当前显示元素的类名
  - **navigation** Object 导航配置项
    - **element** Array/Nodelist *(默认: [ ])* HTML DOM 集合
    - **eventType** String *(默认: 'click')* 绑定到导航元素上的事件类型
    - **activeClassName** String *(默认: 'presentr-nav-active')* 当前导航元素的类名
  - **enableHash** Boolean *(默认: true)* 是否改变`location.hash`的值
  - **actionArea** HTMLElement *(默认: document)* 手势区域
  - **onChangeStart** Function 动画开始前调用
  - **onChangeEnd** Function 动画完成后调用

### 例子

```javascript
var presentr = new Presentr(document.querySelector('#presentr'), {
  width: 1000,
  height: 800,
  startIndex: 0,
  cycle: true,
  speed: 400,
  lock: false,
  timingFunction: 'ease',
  effect: 'fade',
  activeClassName: 'active',
  navigation: {
    elements: document.querySelectorAll('#navigation>li'),
    eventType: 'click',
    activeClassName: 'nav-active'
  },
  enableHash: true,
  actionArea: document,
  onChangeStart: function(targetIndex, prevIndex){
    console.log(targetIndex, prevIndex);
  },
  onChangeEnd: function(index){
    console.log(index);
  }
});
```

## API
  - `slides` 所有滑块元素的集合
  - `options` 配置参数
  - `show(index)` 直接显示某一个滑块，无动画
  - `prev(duration)` 显示上一个
  - `next(duration)` 显示下一个
  - `gotoSlide(index, duration)` 跳到某一个滑块，有动画过度， `duration`为动画时长
  - `getIndex()` 返回当前滑块的索引
  - `lock(direction)` 锁定某一方向的手势操作, `direction`的值同[配置项](#配置项)中的**lock**一样
  - `unLock(direction)` 解锁手势操作
  - `fullScreen(zIndex)` 设置全屏, `zIndex`为全屏时容器元素的`z-index`
  - `cancelFullScreen()` 退出全屏
  - `isFullScreen` 返回布尔值, 表示当前是否是全屏状态
  - `destory()` 恢复 HTML 样式，销毁实例化对象