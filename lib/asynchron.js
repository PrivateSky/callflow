/*
    asynchron: trying a better syntax for promises...
 */

function mkArgs(myArguments, from , promises, positions){
    if(myArguments.length <= from){
        return [];
    }
    var args = [];
    for(var i = from; i<myArguments.length;i++){
        args.push(myArguments[i]);
    }

    for(var i = 0; i < args.length ; i++){
        if(Q.isPromise(args[i])){
            promises.push(args[i]);
            positions.push(i);
        }
    }

    return args;
}

function errorLogger(error){
    if(typeof asynchron_logError == "undefined"){
        console.log("Debug error:", error, error.stack, new Error().stack);
    } else {
        asynchron_logError(error);
    }
}


var Q = require("Q");

function getWaitFunction(contextCallBack){
    return function(){
        var promises  = [];
        var positions = [];
        var args = mkArgs(arguments, 0, promises, positions );
        var callBack;
        if(contextCallBack != undefined){
            callBack = contextCallBack(this);
        } else {
            callBack = this;
        }

        function callItFinally(values){
            for(var i=0; i < positions.length; i++){
                args[positions[i]] = values[i];
            }
            try{
                callBack.apply(null,args);
            } catch(error){
                errorLogger(error);
            }
        }

        if(promises.length == 0){
            callItFinally(args);
        } else {
            Q.all(promises)
                .then(function (results) {
                    callItFinally(results);
                },function (error) {
                    errorLogger(error);
                } );
        }
    };
}

Function.prototype.wait = getWaitFunction();

if(typeof createSwarmCallback != "undefined"){
    Function.prototype.swait = getWaitFunction(createSwarmCallback);
}


function asyncCreator(errorConverter, wantFails, haveTimeout, json){
    var startArgs = 0
    if(haveTimeout){
        startArgs = 1;
    }
    return  function (){
        var promises  = [];
        var positions = [];
        var args = mkArgs(arguments, startArgs,  promises, positions );
        var callBack = this;
        var deferred = Q.defer();

        function callItFinally(values){
            for(var i=0; i < positions.length; i++){
                args[positions[i]] = values[i];
            }

            args.push(function (error, value) {
                if (error) {
                        errorConverter(deferred,error);
                } else {
                    if(json){
                        try{
                            //console.log("Value:",value, "!");
                            var res = JSON.parse(value);
                            value = res;
                        } catch(err){
                            console.log("Bad json format resulted for jasync call!", value);
                            errorLogger(err);
                        }
                    }
                    deferred.resolve(value);
                }
            });

            callBack.apply(null,args);
        }

        if(promises.length ==0){
            callItFinally();
            return deferred.promise;
        } else {
                if(wantFails){
                    Q.allSettled(promises).then(function(results){
                        for(var i = 0; i < results.length ; i++ ){
                            if(results[i].state !== "fulfilled"){
                                    //console.log(results[i]);
                                    return callBack.apply(null,[results[i].reason]);
                                    //deferred.reject(results[i].reason);
                            }
                        }
                    }).done();
                }  else {
                    Q.all(promises)
                        .then(function (results) {
                                callItFinally(results);
                        },
                        function (error) {
                                errorConverter(deferred,error);
                        }
                    );
                }


        }

        if(haveTimeout){
          var timeOut = arguments[0];
            return deferred.promise.timeout(timeOut)
        }
        return deferred.promise;
    }
}

Function.prototype.nasync  =  asyncCreator(function(deferred, error){
                                            deferred.resolve(null);
                                        }
                             );

Function.prototype.async  =  asyncCreator(function(deferred, error){
                                            deferred.reject(error);
                                        }
                              );

Function.prototype.jasync  =  asyncCreator(function(deferred, error){
        deferred.reject(error);
    },false,false,true
);

Function.prototype.fail  =  asyncCreator(function(deferred, error){
                                            deferred.reject(error);
                                        },
                                        true
                            );


Function.prototype.timeout  =  asyncCreator(function(deferred, error){
                                            deferred.reject(error);
                                        },
                                        true, true
                                 );

