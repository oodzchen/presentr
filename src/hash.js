// hash
var hash = {
  init: function(presentr){
    var self = this;
    var currHash = window.location.hash.replace('#', '');
    var hashMap = {};

    self.presentr = presentr;
    self.hashes = presentr.slides.map(function(item, i){
      return item.getAttribute('data-hash') || String(i);
    });

    self.hashes.forEach(function(item, i){
      hashMap[item] = i;
      hashMap[i] = i;

      self.presentr.slides[i].setAttribute('data-hash', item);
    });

    self.hashMap = hashMap;

    if(self.hashMap.hasOwnProperty(currHash)){
      self.presentr.show(self.hashToIndex(currHash));
    }else{
      self.presentr.show(self.presentr.options.startIndex);
      window.location.hash = self.hashes[self.presentr.options.startIndex];
    }

    self.addEvent();

  },
  setHash: function(index){
    var currHash = window.location.hash.replace('#', '');

    if(this.hashToIndex(currHash) === index) return;

    this.removeEvent();
    window.location.hash = this.hashes[index];
    this.addEvent();
  },
  onHashChange: function(e){
    var currHash = window.location.hash.replace('#', '');

    if(!this.hashMap.hasOwnProperty(currHash)) return;

    this.presentr.gotoSlide(this.hashToIndex(currHash));

    e.stopImmediatePropagation();
  },
  hashToIndex: function(str){
    return this.hashMap[str];
  },
  addEvent: function(){
    this.onHashChange = this.onHashChange.bind(this);
    window.addEventListener('hashchange', this.onHashChange, false);
  },
  removeEvent: function(){
    window.removeEventListener('hashchange', this.onHashChange, false);
  },
  destroy: function(){
    var self = this;
    self.hashes.forEach(function(item, i){
      self.presentr.slides[i].removeAttribute('data-hash');
    });

    self.removeEvent();
  }
};