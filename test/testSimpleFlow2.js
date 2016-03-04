var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

assert.callback("Simple test callback flow", function(end){
    var expectedLogs = "begin" +
        "step";

    function testResults(logs){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            this.logs = "";
            this.logs+="begin";
            this.step();
        },
        step:function(a){
            this.logs += "step";
            console.log(this.logs);
            testResults(this.logs);
        }
    });
    f();
    f();

})



