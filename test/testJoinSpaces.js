var FS = require('fs');
var flow = require("callflow");


/* do trim of whitespaces! */

var fJoin = flow.createFlow("Flow example", {
    begin:function(){
        FS.readFile("./callflow.js", this.continue("fileRead"));

    },
    fileRead:function(err, data){
        this.next("doSomething", "Call doSomething", data);
        this.doSomething2(data);
    },
    doSomething: function(data){
        this.data = data;
    },
    doSomething2: function(){
        console.log("Did it!")
    },
    end:{
        join:" doSomething , doSomething2       ",
        code:function(){
            console.log(this.data.toString());
            console.log("Success!");
        }
    }
});

fJoin();
