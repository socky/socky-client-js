if(typeof Function.prototype.scoped_to == 'undefined'){
  Function.prototype.scoped_to = function(context, args){
    var f = this;
    return function(){
      return f.apply(context, Array.prototype.slice.call(args || [])
        .concat(Array.prototype.slice.call(arguments)));
    };
  };
};