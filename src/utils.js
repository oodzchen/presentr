// utils
var utils = {
  extend: function (targetObj, obj, deep) {
    var target = targetObj;

    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        var val = obj[name];

        if(deep && typeof val === 'object' && !(val instanceof Node)){
          target[name] = this.extend(target[name], val, deep);
        }else{
          target[name] = obj[name];
        }
        
      }
    }

    return target;
  },
  clone: function (obj, deep){
    var cloneObj = {};

    if(typeof obj !== 'object' || obj instanceof Node) return obj;

    if(obj instanceof Array){
      cloneObj = [];
    }

    for(var name in obj){
      var val = obj[name];

      if(!obj.hasOwnProperty(name)) continue;

      if(deep && typeof val === 'object'){
        cloneObj[name] = this.clone(val, deep);
      }else{
        cloneObj[name] = val;
      }
      
    }

    return cloneObj;
  },
  setStyle: function (element, obj){
    var styles = this.getPrefixedCSSObj(obj);

    utils.extend(element.style, styles);
  },
  getPrefixedCSSObj: function (obj){
    var prefixed, prop;

    for(prop in obj){

      if(obj.hasOwnProperty(prop)){
        prefixed = this.getPrefixedCSS(prop);

        if(prefixed === prop || prefixed === null) continue;

        obj[prefixed] = obj[prop];
        delete obj.prop;
      }
    }

    return obj;
  },
  getPrefixedCSS: function (prop) {
    var style = document.body.style;
    var propName = prop;
    var vendors = ['Moz', 'Webkit', 'O', 'MS', 'ms'];
    var upperCase = propName.charAt(0).toUpperCase() + propName.slice(1);
    var camel, i;

    if (propName in style) {

      return propName;

    } else {
      for (i = 0; i < vendors.length; i++) {
        camel = vendors[i] + upperCase;

        if (camel in style) {
          return camel;
        }
      }

      return null;
    }
  }
};