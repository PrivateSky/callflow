var asynchron = require("../lib/asynchron.js");
var flow = require("../lib/flow.js");

function asyncReturnsTrue(value, callback){
    setTimeout(function(){
        callback(null, true);
    }, 100);
}

//next, continue,
//

var f = flow.create("Flow example", {
    begin:function(a1,a2, callback){
        this.callback = callback;
        if(a1<a2){
            this.next("step1", "sadasdas", a1);
            this.next(this.step2, "why", a2);
        } else {
            this.next("step2","why", a2);
            this.next("step2","why", a2);
            //this.step2.why("hhh")(a2);  //nope...
        }
    },

    step1:function(a){
        this.result = a;
        this.next("end", "why");
        this.next("end", "why2");
    },

    step2:function(a){
        asyncReturnsTrue(a, this.continue("step3", "why"));
    },
    step3:function(a){
        asyncReturnsTrue(a, this.continue("end", "why"));
    },
    end:{
        join:'step1,step2',
        code:function(){
            if(b){
                this.result = b;
            }
        }
    },
    error:function(error){
        if(b){
            this.result = b;
        }
    }
});


//asyncReturnsTrue(function(){});

var g = {
    begin:function(){
        asyncReturnsTrue(a, this.continue("end"));
    },
    end:function(){

    }
}
