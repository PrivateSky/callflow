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
        "callback" ;

    function testResults(){
        assert.equal(logs,expectedLogs);
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            for(var i=0;i<3;i++){
                asyncReturnsTrue(this.continue("callback", "call calback"));
            }
        },
        callback:function(a){
            logs += "callback";

        },
        end:{
            join:"callback",
            code:function(){
                testResults();
            }
        }
    });
    f();
})



