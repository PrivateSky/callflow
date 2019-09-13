require("../../../psknode/bundles/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("parallelExceptionCase", {
    public: {
        result: "int"
    },
    start: function (callback) {
        this.result = 0;
        this.callback = callback;
        var serial = this.serial(this.doJoin);
        serial.doStep(1);
        serial.doStep(2);
        serial.doStepErr("Intentional error");

    },
    doStep: function (value) {
        this.result += value;
    },
    doStepErr: function (value) {
        throw new Error(value);
    },
    doJoin: function (err) {
        assert.equal(this.result, 3, "There is a problem with the callback sequence");
        assert.notEqual(err, null, err.message);
        this.callback();
    }
})();
assert.callback("Serial stepError test",function(callback){

    f.start(callback);

})


