require("../../../psknode/bundles/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("joinsExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.result = 0;
        this.callback=callback;
        var join = this.join(this.doJoin);

        join.doStep1(1, join.asyncCode);
        join.doStep2(2);
        join.doStep1(8, this.asyncCode);
    },
    doStep1:function(value, callback){
        this.result += value;
        setTimeout(callback,1);
    },
    doStep2:function(value){
        this.result += value;
    },
    doJoin:function(){
        assert.equal(this.result,111,"Results don't match");
        this.callback();
        },
    asyncCode: function(){
        this.result += 100;
    }
})();
assert.callback("Joins async test",function(callback){
    f.start(callback);
})