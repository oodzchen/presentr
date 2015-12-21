// navigation
var navigation = {
  initialized: false,
  init: function(presentr){
    var self = this;

    self.config = presentr.options.navigation;
    self.elements = self.config.elements;
    self.presentr = presentr;

    if(!self.elements || self.elements.length === 0) return;

    Array.prototype.slice.call(self.elements).forEach(function(item, i){
      item.setAttribute('data-index', i);
      item.addEventListener(self.config.eventType, self.eventHandler, false);
    });

    self.update();
    self.initialized = true;

  },
  eventHandler: function(e){
    var index = Number(this.getAttribute('data-index'));

    e.preventDefault();
    presentr.gotoSlide(index);
  },
  getIndex: function(){
    var i, len = this.elements.length;

    for(i = 0; i < len; i++){
      if(this.elements[i].classList.contains(this.config.activeClassName)){
        return i;
      }
    }

    return 0;
  },
  update: function(index){

    if(this.elements.length === 0) return;

    var targetIndex = arguments.length > 0 ? index : this.presentr.getIndex();

    this.elements[this.getIndex()].classList.remove(this.config.activeClassName);
    this.elements[targetIndex].classList.add(this.config.activeClassName);
  },
  destroy: function(){
    var self = this;
    if(!self.initialized) return;

    Array.prototype.slice.call(self.elements).forEach(function(item, i){
      item.removeAttribute('data-index');
      item.classList.remove(self.config.activeClassName);
      item.removeEventListener(self.config.eventType, self.eventHandler, false);
    });
    self.initialized = false;
  }
};