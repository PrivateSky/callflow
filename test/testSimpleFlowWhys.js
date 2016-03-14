var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;
var why = require("../../whys/lib/why.js");

process.env['RUN_WITH_WHYS'] = true;
assert.callback("Simple flow-why test", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step";

    function testResults(context){
        console.log(JSON.stringify(context.getExecutionSummary(),null,4));
        var executionSummary = context.getExecutionSummary();
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        assert.equal(executionSummary.calls.hasOwnProperty('***Starting flow: Flow'),true,"The execution summary does not provide the starting point");
        assert.equal(executionSummary.calls['***Starting flow: Flow'].calls.hasOwnProperty('begin to step'),true,"The execution summary does not contain call: begin to step");
        end();
    }

    var f = flow.create("Flow", {
        begin:function(a1,a2){
            logs+="begin";
            this.step.why("Because")();
        },
        step:function(a){
            logs += "step";
            var context = why.getGlobalCurrentContext();
            setTimeout(function(){testResults(context)},10);
        }
    });
    f();
})



