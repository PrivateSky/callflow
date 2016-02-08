var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

assert.callback("Simple test callback join", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step1" +
        "send" +
        "send" +
        "step2" +
        "end";

    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            this.step1();
            this.send();
            this.step2();
        },
        step1:function(a){
            logs += "step1";
        },
        step2:function(a){
            logs += "step2";
        },
        send:{
            join:'step1',
            code:function(){
                logs+="send";
            }
        },
        end:{
            join:"step1,step2",
            code:function(){
                logs += "end";
                testResults();

            }
        }
    });
    f();
})



