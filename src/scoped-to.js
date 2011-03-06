if(typeof Function.prototype.scopedTo == 'undefined'){
  Function.prototype.scopedTo = function(context, args){
    var f = this;
    return function(){
      return f.apply(context, Array.prototype.slice.call(args || [])
        .concat(Array.prototype.slice.call(arguments)));
    };
  };
};