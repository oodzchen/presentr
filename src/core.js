var Presentr = function(element, config) {

  if(!(this instanceof Presentr)) return new Presentr(element, config);

  var container = element;
  var slice = Array.prototype.slice;
  var childs = slice.call(element.children);
  var elementNum = childs.length;
  var lastIndex = elementNum - 1;
  var innerBox;
  var touchable = 'ontouchstart' in window;
  var events = touchable ? {
    touchstart: 'touchstart',
    touchmove: 'touchmove',
    touchend: 'touchend',
    touchleave: 'touchleave'
  } : {
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',
    touchleave: 'mouseleave'
  };
  var mobileChrome = (function(){
    var version = navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/Chrome\/(\d+)/i);

    return (!!version && version[1]) > 40;
  })();

  var MINIMUMSPEED = 1;

  var defaults = {
    width: container.offsetWidth,
    height: container.offsetHeight,
    startIndex: 0,
    cycle: false,
    speed: 300,
    lock: false, // true/'both', 'left', 'right'
    timingFunction: 'ease',
    effect: 'slide', // 'fade', 'none'
    activeClassName: 'presentr-active',
    navigation: {
      elements: [], // DOM elements collection
      eventType: 'click',
      activeClassName: 'presentr-nav-active'
    },
    enableHash: true,
    actionArea: document, // draggable area on 'slide' effect
    onChangeStart: function(targetIndex, prevIndex){},
    onChangeEnd: function(index){}
  };

  var options = utils.extend(defaults, config, true);

  var transition = utils.getPrefixedCSS('transition');
  var transitions = {
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd',
    OTransition: 'oTransitionEnd',
    MSTransition: 'MSTransitionEnd',
    transition: 'transitionend'
  };
  var transitionend = transitions[transition];
  var transform = utils.getPrefixedCSS('transform');

  if (transition === null || transform === null) return;

  var effects = {
    'slide': slideTo,
    'fade': fadeTo,
    'none': directTo
  };

  var _this = utils.extend(this, {
    show: show,
    prev: prev,
    next: next,
    lock: lock,
    unLock: unLock,
    gotoSlide: gotoSlide,
    getIndex: getCurrIndex,
    fullScreen: fullScreen,
    cancelFullScreen: cancelFullScreen,
    isFullScreen: isFullScreen,
    destroy: destroy
  });

  _this.options = options;

  function initialize() {

    setDom();

    loadEvents();

    if(options.navigation.elements || options.navigation.elements.length > 0) navigation.init(_this);

    if(options.enableHash){
      hash.init(_this);
    }else{
      show(options.startIndex);
    }
  }

  function setDom() {
    var slideStyle = {
      width: options.width + 'px',
      height: options.height + 'px'
    };
    var extendStyle = getEffectStyle(options.effect);

    slideStyle = utils.extend(slideStyle, extendStyle);

    innerBox = document.createElement('div');

    utils.setStyle(container, {
      position: 'relative',
      overflow: 'hidden',
      visibility: 'hidden'
    });

    utils.setStyle(innerBox, {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%'
    });

    childs.forEach(function(elem) {

      utils.setStyle(elem, slideStyle);
      innerBox.appendChild(elem);

    });

    container.appendChild(innerBox);
    childs = slice.call(innerBox.children);
    _this.slides = childs;

    if (options.effect === 'slide' && options.cycle) {
      var cloneFirst = childs[0].cloneNode(true);
      var cloneLast = childs[lastIndex].cloneNode(true);
      cloneFirst.removeAttribute('data-hash');
      cloneLast.removeAttribute('data-hash');

      innerBox.insertBefore(cloneLast, innerBox.firstChild);
      innerBox.appendChild(cloneFirst);

      utils.setStyle(innerBox, {
        left: -options.width + 'px',
        width: options.width * 3 + 'px'
      });
    }

    setTimeout(function(){
      container.style.visibility = '';
    }, 0);

  }

  function getEffectStyle(effect){
    var styles;

    switch(effect){
      case 'slide':
        styles = {
          display: 'none',
          float: 'left'
        };
        break;
      case 'fade':
        styles = {
          position: 'absolute',
          left: 0,
          top: 0,
          opacity: 0
        };
        break;
      case 'none':
        styles = {
          position: 'absolute',
          left: 0,
          top: 0,
          display: 'none'
        };
        break;
      default:
        styles = {
          display: 'none',
          float: 'left'
        };
        break;
    }

    return styles;
  }

  function loadEvents() {

    innerBox.addEventListener(events.touchstart, onTouchStart, false);

  }

  var startX = 0,
    transX = 0,
    touchSpeed = 0;
  function onTouchStart(e) {

    e.preventDefault();
    e.stopPropagation();

    if(lockDir === directions.both) return;

    startX = touchable ? e.touches[0].pageX : e.pageX;

    if (animating) {
      if(options.effect === 'slide'){
        stop();
        transX = Number(innerBox.style[transform].match(/matrix\(1,\s?0,\s?0,\s?1,\s?(.*?),\s?0\)/)[1]);
        startX -= transX;
      }else{
        return;
      }
      
    }

    options.actionArea.addEventListener(events.touchmove, onTouchMove, false);
    options.actionArea.addEventListener(events.touchend, onTouchEnd, false);
    options.actionArea.addEventListener(events.touchleave, onTouchEnd, false);
  }

  function onTouchMove(e) {
    var pageX = touchable ? e.touches[0].pageX : e.pageX;
    var currTransX = pageX - startX;
    touchSpeed = currTransX - transX;
    transX = currTransX;

    e.preventDefault();
    e.stopPropagation();

    if(options.effect !== 'slide') return;

    if(transX > 0 && lockDir === directions.left || transX < 0 && lockDir === directions.right){
      options.actionArea.removeEventListener(events.touchmove, onTouchMove, false);
      options.actionArea.removeEventListener(events.touchend, onTouchEnd, false);
      options.actionArea.removeEventListener(events.touchleave, onTouchEnd, false);

      return;
    }

    innerBox.style[transform] = 'matrix(1, 0, 0, 1, ' + transX + ', 0)';

  }

  function onTouchEnd(e) {
    var switchWidth = parseInt(options.width / 3);
    var currIndex = getCurrIndex();

    e.preventDefault();
    e.stopPropagation();

    if(transX !== 0){

      var speed = touchSpeed === 0 ? options.speed : 100 * (100 - MINIMUMSPEED) / touchSpeed;

      if (!options.cycle && (currIndex === 0 && transX > 0 || currIndex === lastIndex && transX < 0)) {

        slideBack();

      } else {

        if (Math.abs(touchSpeed) <= MINIMUMSPEED) {

          if (Math.abs(transX) > switchWidth) {

            changeSlide(speed);

          } else {

            slideBack();

          }

        } else {

          changeSlide(speed);

        }

      }

    }

    startX = 0;
    transX = 0;
    touchSpeed = 0;

    options.actionArea.removeEventListener(events.touchmove, onTouchMove, false);
    options.actionArea.removeEventListener(events.touchend, onTouchEnd, false);
    options.actionArea.removeEventListener(events.touchleave, onTouchEnd, false);

  }

  function changeSlide(speed){
    var duration = Math.abs(speed);

    if (duration > options.speed) {
      duration = options.speed;
    }

    if (transX > 0) {
      prev(duration);
    } else {
      next(duration);
    }

  }

  function slideBack(){
    var index = getCurrIndex();

    effects[options.effect](index);
  }

  function next(duration) {
    var index = getCurrIndex();

    effects[options.effect](index + 1, duration);

  }

  function prev(duration) {
    var index = getCurrIndex();

    effects[options.effect](index - 1, duration);

  }

  function slideTo(index, duration){
    var currIndex = getCurrIndex();
    var speed = duration || options.speed;
    var distance = options.width;
    var targetIndex = getTargetIndex(index);

    if(targetIndex === null) return;

    if(currIndex === index){
      distance = 0;
    }else if(currIndex < index){
      distance = -distance;
    }

    if(animating) return;

    onChangeStart(targetIndex, currIndex);

    animating = true;
    animate(innerBox, {
      transform: 'matrix(1, 0, 0, 1, ' + distance + ', 0)'},
      speed, function(){
      animating = false;

      // fix touch issue on mobile chrome
      if(mobileChrome){
        innerBox.style.width = (options.width*elementNum + 1) + 'px';
        setTimeout(function(){
          innerBox.style.width = options.width*elementNum + 'px';
        }, 0);
      }

      innerBox.style[transform] = 'matrix(1, 0, 0, 1, 0, 0)';
      show(targetIndex);
    });
  }

  function fadeTo(index, duration){
    var currIndex = getCurrIndex();
    var speed = duration || options.speed;
    var opacity = 1;
    var targetIndex = getTargetIndex(index);

    if(targetIndex === null || currIndex === targetIndex) return;

    if(animating) return;

    onChangeStart(targetIndex, currIndex);

    animating = true;
    animate(childs[currIndex], {
      opacity: 0},
      speed);

    animate(childs[targetIndex], {
      opacity: 1},
      speed, function(){
      animating = false;

      show(targetIndex);
    });
  }

  function directTo(index){
    var currIndex = getCurrIndex();
    var targetIndex = getTargetIndex(index);

    onChangeStart(targetIndex, currIndex);
    show(targetIndex);
  }

  function onChangeStart(targetIndex, currIndex){
    if(navigation.initialized){
      navigation.update(targetIndex);
    }

    if(typeof options.onChangeStart === 'function'){
      options.onChangeStart.call(_this, targetIndex, currIndex);
    }
  }

  function onChangeEnd(index){
    if(navigation.initialized){
      navigation.update(index);
    }

    if(typeof options.onChangeEnd === 'function'){
      options.onChangeEnd.call(_this, index);
    }
  }

  function getTargetIndex(index){

    var targetIndex = index;

    if(targetIndex < 0 - 1 || targetIndex > lastIndex + 1) return null;

    if(targetIndex === 0 - 1){

      if(options.cycle){

        targetIndex = lastIndex;

      }else{

        return null;
      }

    }else if(targetIndex === lastIndex + 1){

      if(options.cycle){

        targetIndex = 0;

      }else{

        return null;
      }

    }

    return targetIndex;
  }

  function gotoSlide(index, duration){

    var currIndex = getCurrIndex();
    var targetIndex = (typeof index === 'string' && options.enableHash) ? hash.hashToIndex(index) : index;

    if(targetIndex === currIndex || targetIndex < 0 || targetIndex > lastIndex) return;

    if(animating) return;

    if(options.effect === 'slide'){

      if(currIndex > targetIndex){

        childs[currIndex-1].style.display = 'none';
        childs[targetIndex].style.display = '';

      }else{

        childs[currIndex+1].style.display = 'none';
        childs[targetIndex].style.display = '';
        
      }
    }

    effects[options.effect](targetIndex, duration);
    
  }

  var directions = {
    'false': 0,
    'left': 1,
    'right': 2,
    'true': 3,
    'both': 3,
  };
  var lockDir = directions[options.lock];
  function lock(dirName){
    var direction = directions[dirName];

    if(arguments.length === 0){
      direction = directions.both;
    }else{
      if(direction === lockDir || !directions.hasOwnProperty(dirName)) return false;
    }

    lockDir = direction;
  }

  function unLock(dirName){
    var direction = directions[dirName];

    if(arguments.length === 0){
      direction = directions.both;
    }else{
      if(!directions.hasOwnProperty(dirName)) return false;
    }

    if(lockDir === directions.both - direction) return false;

    lockDir = lockDir <= direction ? 0 : lockDir - direction;
  }

  function show(index) {
    var targetIndex = (typeof index === 'string' && options.enableHash) ? hash.hashToIndex(index) : index;
    var targetSlide = childs[targetIndex];
    var nextSlide, prevSlide,
      slides = [],
      liveChild = innerBox.children;

    if (!targetSlide) return false;

    if(options.effect === 'slide'){
      if (index > 0) {
        prevSlide = childs[targetIndex - 1];
        slides.push(prevSlide);
        liveChild[0].style.display = 'none';
      } else {
        liveChild[0].style.display = '';
      }

      slides.push(targetSlide);

      if (index < lastIndex) {
        nextSlide = childs[targetIndex + 1];
        slides.push(nextSlide);
        liveChild[liveChild.length - 1].style.display = 'none';
      } else {
        liveChild[liveChild.length - 1].style.display = '';
      }

      var currSlides = getCurrSlides();
      currSlides.forEach(function(item) {
        item.classList.remove(options.activeClassName);

        if (slides.indexOf(item) === -1) {
          item.style.display = 'none';
        }

      });

      if (!options.cycle) {
        innerBox.style.left = -options.width * (slides.indexOf(targetSlide)) + 'px';
        innerBox.style.width = options.width * slides.length + 'px';
      }

      targetSlide.classList.add(options.activeClassName);
      slides.forEach(function(item) {
        item.style.display = '';
      });

    }else{
      var currIndex = getCurrIndex();
      childs[currIndex].classList.remove(options.activeClassName);
      targetSlide.classList.add(options.activeClassName);

      if(options.effect === 'fade'){
        targetSlide.style.opacity = 1;
      }else{
        childs[currIndex].style.display = 'none';
        targetSlide.style.display = '';
      }
      
    }

    if(options.enableHash){
      hash.setHash(targetIndex);
    }

    onChangeEnd(index);
  }

  var animating = false,
    onTransitionEnd;
  function animate(element, targetStyles, speed, callback) {

    element.style[transition] = 'all ' + speed + 'ms ' + options.timingFunction;

    onTransitionEnd = function onTransitionEnd(e) {
      element.style[transition] = '';

      if(typeof callback === 'function') callback.call(element);
      element.removeEventListener(transitionend, onTransitionEnd, false);
    };

    element.addEventListener(transitionend, onTransitionEnd, false);

    utils.setStyle(element, targetStyles);
  }

  function stop(jump, toEnd) {

    if (!animating) return;

    innerBox.removeEventListener(transitionend, onTransitionEnd, false);
    if(!jump){
      innerBox.style[transform] = window.getComputedStyle(innerBox, null)[transform];

      if(arguments.length > 1){

        if(toEnd){
          onTransitionEnd();
        }else{
          innerBox.style[transform] = 'matrix(1, 0, 0, 1, 0, 0)'; // to start!
          transX = 0;
        }
        
      }
    }
    innerBox.style[transition] = '';
    animating = false;

  }

  function getCurrSlides() {
    var index = getCurrIndex();

    return [childs[index - 1], childs[index], childs[index + 1]].filter(function(item) {
      return !!item;
    });
  }

  function getCurrIndex() {
    for (var i = 0; i < elementNum; i++) {
      if (childs[i].classList.contains(options.activeClassName)) {
        return i;
      }
    }

    return 0;
  }

  var onFullScreen = false;
  function fullScreen(zIndex){

    if(onFullScreen) return;

    innerBox.style[transform] = 'matrix(1, 0, 0, 1, 0, 0)';
    innerBox.style[transition] = '';

    presentrStorage.data('old-config', utils.clone(options, true));
    presentrStorage.data('container-style', container.style.cssText);
    presentrStorage.data('innerbox-style', innerBox.style.cssText);

    var height = options.height = window.innerHeight;
    var width = options.width = window.innerWidth;

    onFullScreen = true;

    utils.setStyle(container, {
      position: 'fixed',
      left: 0,
      top: 0,
      height: height + 'px',
      width: width + 'px',
      zIndex: zIndex || 999
    });

    updateStyles();

  }

  function cancelFullScreen(){

    if(!onFullScreen) return;

    options = presentrStorage.data('old-config');

    onFullScreen = false;
    container.style.cssText = presentrStorage.data('container-style');
    innerBox.style.cssText = presentrStorage.data('innerbox-style');

    updateStyles();
  }

  function isFullScreen(){
    return onFullScreen;
  }

  function updateStyles(){
    var slideStyle = {
      width: options.width + 'px',
      height: options.height + 'px'
    };
    var index = getCurrIndex();
    var extendStyle = getEffectStyle(options.effect);

    slideStyle = utils.extend(slideStyle, extendStyle);

    slice.call(innerBox.children).forEach(function(elem) {

      utils.setStyle(elem, slideStyle);

    });

    if (options.effect === 'slide' && options.cycle) {
      utils.setStyle(innerBox, {
        left: -options.width + 'px',
        width: options.width * 3 + 'px'
      });
    }

    show(index);
  }

  function destroy(){
    recoverDom();
    options.actionArea.removeEventListener(events.touchstart, onTouchStart, false);

    if(navigation.initialized){
      navigation.destroy();
    }

    if(options.enableHash){
      hash.destroy();
    }

  }

  function recoverDom(){
    while(container.firstChild){
      container.removeChild(container.firstChild);
    }
    container.removeAttribute('style');

    childs.forEach(function(item){
      item.removeAttribute('style');
      item.classList.remove(options.activeClassName);

      container.appendChild(item);
    });
  }

  initialize();

  return _this;

};