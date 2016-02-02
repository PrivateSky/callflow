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
        if(a1<a2){
            this.next("step1", "beginToStep1", a1);
            this.next("step2", "beginToStep2", a2);
        }
        else {
            this.next("step2","beginToStep1", a2);
            this.next("step1","beginToStep2", a1);
        }
    },

    step1:function(a){
        console.log("Step1 ");
    },
    step2:function(a){
        console.log("Step2 ");
        asyncReturnsTrue(this.continue("step3", "step2ToStep3"));

        this.next("step4","step2ToStep4",a);

    },
    step3:function(a,b){
        console.log("Step3");
    },
    step4:function(a){
        console.log("Step4")
    },
    step5:function(a){
        console.log("Step5");
    },
    step6:function(){
        console.log("Step6");
    },
    send:{
        join:"step1,step2",
        code:function(){
            console.log("Send");
            this.next("step5","sendToStep5");
            asyncReturnsTrue(this.continue("step6","sendToStep6"));
        }
    },
    end:{
        join:'step1,step3,step4,step5,step6',
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