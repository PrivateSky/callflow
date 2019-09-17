require("../../../psknode/bundles/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("joinsExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.callback=callback;
        this.result = 0;
        var join = this.join(this.doJoin);

        for(var i = 0; i < 10; i++ ){
            join.doStep(1, join.asyncCode);
        }
    },
    doStep:function(value, callback){
        this.result += value;
        setTimeout(callback,1);
    },

    doJoin:function(err){
        assert.equal(err,null,"Error");
        assert.equal(this.result,1010,"Results don't match");
        this.callback();
    },
    asyncCode: function(){
        this.result += 100;
    }
})();
assert.callback("Join array test",function(callback){
    f.start(callback);
});