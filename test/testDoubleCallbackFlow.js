var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}



assert.callback("Simple test callback flow", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "callback" +
        "callback" +
        "end";

    function testResults(){
        assert.equal(logs,expectedLogs);
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            asyncReturnsTrue(this.continue("callback"));
            asyncReturnsTrue(this.continue("callback"));
        },
        callback:function(a){
            logs += "callback";
        },
        end:{
            join:"callback",
            code:function(a){
               logs += "end";
            testResults();
            }
        }
    });
    f();
})



