var asynchron = require("../lib/asynchron.js");
var flow = require("../lib/flow.js");

function asyncReturnsTrue(value, callback){
    setTimeout(function(){
        callback(null, true);
    }, 100);
}


var f = flow.create("Flow example", {
    begin:function(a1,a2, callback){
        this.callback = callback;
        if(a1<a2){
            this.next("step1", a1);
            this.next("step2", a2);
        } else {
            this.next("step2", a2);
            this.next("step2", a2);
        }
    },

    step1:function(a){
        this.result = a;
        this.next("end");
    },

    step2:function(a){
        asyncReturnsTrue(a, this.continue("end"));
    }.why("sdsa"),

    end:function(){
        if(b){
            this.result = b;
        }
    }.join("step1", "step2").why("de aia"),

    error:function(error){

        if(b){
            this.result = b;
        }
    }
});


//asyncReturnsTrue(function(){});


{
    begin:function(){
        asyncReturnsTrue(a, this.continue("end"));
    },
    end:function(){

    }
}
