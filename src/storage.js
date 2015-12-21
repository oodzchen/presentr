// storage
var presentrStorage = {
  data: function(key, value){
    if(typeof key !== 'string') return null;

    this.storage = this.storage || {};

    if(arguments.length === 1){

      if(this.storage.hasOwnProperty(key)){
        return this.storage[key];
      }else{
        return null;
      }
      
    }else{
      this.storage[key] = utils.clone(value, true);
    }

  }
};