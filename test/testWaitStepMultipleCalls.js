var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

assert.callback("Simple test callback flow", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step1"+
        "step2"+
        "step3"+
        "end";
    var steps = ["step1","step2","step3"];

    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Wait for multiple calls of the same step Test", {
        begin:function(){
            logs+="begin";
            steps.forEach(this.step);
        },
        step:function(a){
            logs += a;
        },
        end:{
            join:"step",
            code:function(){
                logs += "end";
                testResults();
            }
        }
    });
    f();

})


