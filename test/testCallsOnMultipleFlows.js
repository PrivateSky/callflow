
var flow = require("../lib/flow");
var assert       = require('double-check').assert;

assert.callback("Test calls on different flows", function(end){
    var expected1 = "FLOW1FLOW1FLOW1end";
    var expected2 = "FLOW2FLOW2end";

    var successes = 0;
    function testResults(logs,expected){
        assert.equal(logs,expected,"Difference between expected logs and actual results");
        if(++successes === 2) {
            end();
        }
    }

   var composeFlow1 = flow.create("FLOW 1", {
           begin:function(expected){
               this.logs="";
               this.expected = expected;
               this.logs = "FLOW1";
               this.step("FLOW1");
               this.next("step",undefined,"FLOW1")

           },
           step:function(a){

               this.logs +=a
           },
           end:{
               join:"step",
               code:function(){
                   this.logs += "end";
                   testResults(this.logs,expected1);
               }
           }
       });

   var composeFlow2 = flow.create("FLOW 2", {

       begin:function(expected){
           this.expected = expected;
           this.logs = "";
           this.logs = "FLOW2";
           this.step("FLOW2");

       },
       step:function(a){
           this.logs += a;
       },
       end:{
           join:"step",
           code:function(){
               this.logs += "end";
               testResults(this.logs,expected2);
           }
       }
    });


   composeFlow1(expected1);//FLOW 1
   composeFlow2(expected2); //FLOW 2

})



