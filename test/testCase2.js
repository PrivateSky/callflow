var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}
assert.callback("testCase2",function(end) {
    var logs = "";
    var expectedLogs = "begin" +
        "step1" +
        "step2" +
        "step2" +
        "firstJoin" +
        "step3" +
        "step3" +
        "step3" +
        "end";

    function testResults() {
        assert.equal(logs, expectedLogs, "problemsAtNextCalls");
        end();
    }

    var f = flow.create("Flow example", {

        begin: function (a1, a2) {
            logs += "begin";
            this.next("step1", "becauseStep1");
            this.next("step2", "becauseStep2");
            asyncReturnsTrue(this.continue("step3", "becauseStep3"))
        },

        step1: function (a) {
            logs += "step1";
            this.next("step2", "becauseStep2");
        },
        step2: function (a) {
            logs += "step2";
            asyncReturnsTrue(this.continue("step3", "step2ToStep3"));
        },

        step3: function (a, b) {
            logs += "step3";
        },
        firstJoin: {
            join: "step1,step2",
            code: function (a, b) {
                logs += "firstJoin";
            }
        },
        end: {
            join: 'step1,step3',
            code: function () {
                logs += "end";
                testResults();
            }
        },
        error: function (error) {
            if (b) {
                this.result = b;
            }
        }
    });
    f("a1", "a2");
});

