require("../../../psknode/bundles/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("serialExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.result = 0;
        this.callback=callback;
        var serial = this.serial(this.onResults);
        for(var i=0; i<10; i++){
            serial.doStep1(1).doStep2(2).doAsync(serial.asyncStep);
        }
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
        }, 2);
    },
    onResults:function(err){
        assert.equal(err,null,"Error in callback sequence");
        assert.equal(this.result,1030,"Results don't match");
        this.callback();
    }
})();
assert.callback("Serial Array Test",function(callback){
    f.start(callback);
})