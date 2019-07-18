$$.registerGlobalSymbol = function(newSymbol, value){
    if(typeof $$[newSymbol] == "undefined"){
        $$[newSymbol] = value;
    } else{
        console.error("Refusing to overwrite $$." + newSymbol);
    }
}

$$.registerGlobalSymbol("handle", function(err){
    if(!err){
        throw err;
    }
})

$$.registerGlobalSymbol("throw", function(message){
    if(!err){
        throw new Error(message);
    }
})

$$.registerGlobalSymbol("error", function(...args){
    console.error(...args);
})

$$.registerGlobalSymbol("warn", function(...args){
    console.warn(...args);
})

$$.registerGlobalSymbol("assert", function(value, explainWhy){
    if(!value){
        throw new Error("Assert false " + explainWhy);
    }
})

$$.registerGlobalSymbol("obsolete", function(...args){
    console.log("OBSOLETE needs to be removed!")
    console.log(...args);
})

$$.registerGlobalSymbol("log", function(...args){
    console.log(...args);
})

$$.log("Does this exists?");

$$.registerGlobalSymbol("syntaxError", function(...args){
    console.log(...args);
})

$$.registerGlobalSymbol("throttlingEvent", function(...args){
    console.log(...args);
})

$$.registerGlobalSymbol("unknownException", function(...args){
    console.log(...args);
})