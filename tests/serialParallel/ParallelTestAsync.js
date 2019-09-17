require("../../../psknode/bundles/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("joinsExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.callback =callback;
        this.result = 0;
        var join = this.parallel(this.doJoin);
        join.doStep1(1).doStep2(2);
        join.doStep1(3).doStep2((4));
        join.doAsync(join.asyncStep);
    },
    doStep1:function(value){
        this.result += value;

    },
    doStep2:function(value){
        this.result += value;
    },
    asyncStep:function(value) {
        this.result += value;
    },
    doAsync:function(callback){
        setTimeout(function(){
            callback(100);
        }, 100);
    },
    doJoin:function(err){
        assert.equal(err,null,"Error");
        assert.equal(this.result,110,"Results don't match");
        this.callback();
    }
})();
assert.callback("Parallel test",function(callback){
    f.start(callback);
})
