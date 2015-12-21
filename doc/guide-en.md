## Usage

The HTML structure should be:

```html
<div id="presentr">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
```

Use Presentr like this:

```javascript
var presentr = new Presentr(document.querySelector('#presentr'));
```

## Config Options
The second parameter of the Presentr function is an object for configs:

  - **width** Number *(default: `offsetWidth` of container element)* width of the presentation
  - **height** Number *(default: `offsetHeight` of container element)* height of the presentation
  - **startIndex** Number *(default: 0)* the index of the slide show at start
  - **cycle** Boolean *(default: false)* whether to cycle the slides
  - **speed** Number *(default: 300)* duration of the change animation
  - **lock** String/Boolean *(default: false)* prevent the guesture on slides, `'left'` will prevent left guesture, `'right'` will prevent right guesture, `true` and `'both'` will prevent both direction.
  - **timingFunction** String *(default: 'ease')* same as `transition-timing-function`
  - **effect** String *(default: 'slide')* animation effects, `'none'` will slide with no animation, `'fade'` will change `opacity` value in animation, `'slide'` will change offset value in animation
  - **activeClassName** String *(default: 'presentr-active')* class name of the active slide
  - **navigation** Object config of the navigation
    - **element** Array/Nodelist *(default: [ ])* HTML DOM collection
    - **eventType** String *(default: 'click')* name of the event bind on the navigation items
    - **activeClassName** String *(default: 'presentr-nav-active')* class name of the active navigation item
  - **enableHash** Boolean *(default: true)* whether change the `location.hash` when change slides
  - **actionArea** HTMLElement *(default: document)* guesture area
  - **onChangeStart** Function run before animation start
  - **onChangeEnd** Function run after animation end

### Example

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
  - `slides` an array contains all of the slide elements
  - `options` reference of the config object
  - `show(index)` show one of the slide with no animation
  - `prev(duration)` go to prev
  - `next(duration)` go to next
  - `gotoSlide(index, duration)` go to one of the slide with effects, `duration` is the duration of animation
  - `getIndex()` return the index of active slide
  - `lock(direction)` lock the guesture on slides, the `direction` value is same as **lock** in the config object
  - `unLock(direction)` unlock the guesture prevention
  - `fullScreen(zIndex)` set presentation size as the size of the viewport, `zIndex` will set the `z-index` property of container element
  - `cancelFullScreen()` quit the full screen state
  - `isFullScreen` return boolean value, indicate whether the presentation is on full screen state
  - `destory()` recovery the DOM styles and destory the instance