
var flow = require("asynchron");
var assert       = require('double-check').assert;

assert.callback("TEST FLOW Instance", function(end){
    var logs = "";
    var expected1 = "FLOW1FLOW1end";
    var expected2 = "FLOW2FLOW2end";
    var expected3 = "FLOW3FLOW3end";


    function testResults(expected){
        console.log(logs,expected)
        assert.equal(logs,expected,"Difference between expected logs and actual results");
        end();
    }

   var composeFlow1 = flow.createFlow("FLOW 1", {
           begin:function(expected){
               this.expected = expected;
               logs = "FLOW1";
               this.step("FLOW1");

           },
           step:function(a){
               logs +=a
           },
           end:{
               join:"step",
               code:function(){
                   logs += "end";
                   testResults(this.expected);
               }
           }
       });

   var composeFlow2 = flow.createFlow("FLOW 2", {

       begin:function(expected){
           this.expected = expected;
           logs = "FLOW2";
           this.step("FLOW2");

       },
       step:function(a){
           logs += a;
       },
       end:{
           join:"step",
           code:function(){
               logs += "end";
               testResults(this.expected);
           }
       }
    });

    var composeFlow3 = flow.createFlow("FLOW 3", {

        begin:function(expected){
            this.expected = expected;
            logs = "FLOW3";
            this.step("FLOW3");

        },
        step:function(a){
            logs += a;
        },
        end:{
            join:"step",
            code:function(){
                logs += "end";
                testResults(this.expected);
            }
        }
    });

   composeFlow1(expected1);//FLOW 1
   composeFlow2(expected2); //FLOW 2
   composeFlow2(expected3); //FLOW 3 This will pass

})



