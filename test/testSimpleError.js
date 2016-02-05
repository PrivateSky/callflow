var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

assert.callback("Simple test callback flow", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "onError";

    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            try{
                this.failmethod();
            }
            catch(e){
                this.error(e);
            }
        },
        error:function(error){
            logs += "onError";
            testResults();
        }
    });
    f();
})



