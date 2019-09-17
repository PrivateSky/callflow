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

        serial.doStep1(1000);
        serial.doAsync();

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
        setTimeout(function () {
            try {
                callback(100);
            }    catch (err){
                assert.notEqual(err,null,"Error expected");
            }
        },100);

    },
    onResults:function(err){
        assert.equal(err,null,"Error");
        assert.equal(this.result,1000,"Results don't match");
        this.callback();
    }
})();
assert.callback("Serial Test",function(callback){
    f.start(callback);
})