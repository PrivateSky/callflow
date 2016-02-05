var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}



assert.callback("testCase1", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step1" +
        "step2" +
        "step3" +
        "step3" +
        "step4" +
        "end";

    function testResults(){
        assert.equal(logs,expectedLogs,"problemsAtAsyncCalls");
        end();
    }


    var f = flow.create("Flow example", {

        begin:function(a1,a2){
            logs+="begin";
            asyncReturnsTrue(this.continue("step3", "step2ToStep3"));
            this.step1();
        },

        step1:function(a){
            logs += "step1";
            this.next("step2","becauseStep2");
        },
        step2:function(a){
            logs += "step2";
            asyncReturnsTrue(this.continue("step3", "step2ToStep3"));
            asyncReturnsTrue(this.continue("step4", "step2ToStep3"));
        },

        step3:function(a,b){
            logs += "step3";
        },
        step4:function(a,b){
            logs += "step4";
        },
        end:{
            join:'step1,step3,step4',
            code:function(){
                logs += "end";
                testResults();
            }
        },
        error:function(error){
            console.log(error.stack);
        }
    });
    f("a1","a2");

})


