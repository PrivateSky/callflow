var asynchron = require("../lib/asynchron.js");
var flow = require("../lib/flow.js");

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 1000);
}


var f = flow.create("Flow example", {

    begin:function(a1,a2){
        console.log("Begin");
            this.next("step1", "beginToStep1", a1);
            this.step1("asfsa", "beginToStep2");

            this.next("step2", "beginToStep2", a2);
    },

    step1:function(a){
        console.log("Step1 ");
    },
    step2:function(a){
        console.log("Step2 ");
        asyncReturnsTrue(this.continue("step3", "step2ToStep3"));
        asyncReturnsTrue(this.continue("step4", "step2ToStep3"));
    },

    step3:function(a,b){
        console.log("Step3");
    },
    step3:function(a,b){
        console.log("Step3");
    },
    step4:function(a,b){
        console.log("Step4");
    },
    end:{
        join:'step1,step3,step4',
        code:function(){
            console.log("end step2Arg:");
        }
    },
    error:function(error){
        if(b){
            this.result = b;
        }
    }
});
f.begin("a1","a2");