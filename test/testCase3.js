var flow = require("../lib/flow.js");
var assert       = require('semantic-firewall').assert;

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 1000);
}

var logs = "";
var expectedLogs = "begin" +
    "step1" +
    "step2" +
    "step2" +
    "firstJoin" +
    "step3" +
    "step3" +
    "end";

function testResults(){
    assert.equal(logs,expectedLogs,"sync->asyncProblem");
}

var f = flow.create("Flow example", {

    begin:function(a1,a2){
        logs+="begin";
        this.step1();
        this.step1();
        this.step2();
    },

    step1:function(a){
        logs+="step1";
        this.next("step2","becauseStep2");
    },
    step2:function(a){
        logs+="step2";
        asyncReturnsTrue(this.continue("step3", "step2ToStep3"));
    },

    step3:function(a,b){
        logs+="step3";
    },
    firstJoin: {
        join: "step1,step2",
        code: function (a, b) {
            logs += "firstJoin";
        }
    },
    end:{
        join:'step1,step3',
        code:function(){
            logs+="end";
            testResults();
        }
    },
    error:function(error){
        if(b){
            this.result = b;
        }
    }
});
f.begin("a1","a2");


