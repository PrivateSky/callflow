$$.registerGlobalSymbol = function(newSymbol, value){
    if(typeof $$[newSymbol] == "undefined"){
        $$[newSymbol] = value;
    } else{
        console.error("Refusing to overwrite $$." + newSymbol);
    }
}

$$.registerGlobalSymbol("autoThrow", function(err){
    if(!err){
        throw err;
    }
})

$$.registerGlobalSymbol("ignoreError", function(err){
    if(err){
        $$.error(err);
    }
})

$$.registerGlobalSymbol("exception", function(message, type){
    if(!err){
        throw new Error(message);
    }
})

$$.registerGlobalSymbol("err", function(...args){
    console.error(...args);
})

$$.registerGlobalSymbol("warn", function(...args){
    console.warn(...args);
})

/* a feature is planned but not implemented (during development) but
also it could remain in production and should be flagged asap*/
$$.registerGlobalSymbol("incomplete", function(...args){
    console.warn(...args);
})

/* used during development and when trying to discover elusive errors*/
$$.registerGlobalSymbol("assert", function(value, explainWhy){
    if(!value){
        throw new Error("Assert false " + explainWhy);
    }
})

/* enable/disabale flags that control psk behaviour*/
$$.registerGlobalSymbol("flags", function(flagName, value){
    $$.incomplete("flag handling not implemented");
})

$$.registerGlobalSymbol("obsolete", function(...args){
    console.log(...args);
})

$$.registerGlobalSymbol("log", function(...args){
    console.log(...args);
})

$$.registerGlobalSymbol("syntaxError", function(...args){
    console.log(...args);
})

/* log unknown exceptions*/
$$.registerGlobalSymbol("unknownException", function(...args){
    console.log(...args);
})

/* PrivateSky event, used by monitoring and statistics*/
$$.registerGlobalSymbol("event", function(...args){
    console.log(...args);
})

/* log throttling event // it is just an event?*/
$$.registerGlobalSymbol("throttlingEvent", function(...args){
    console.log(...args);
})

