
/*
    asynchron: better syntax for promises...
 */

// not belonging here,I reuse this function in other projects, but...
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

var Q = require("Q");
Function.prototype.wait = function(){
    var promises  = [];
    var positions = [];
    var args = mkArgs(arguments, 0, promises, positions );
    var callBack = this;

    function callItFinally(values){
        for(var i=0; i < positions.length; i++){
            args[positions[i]] = values[i];
        }
        callBack.apply(null,args);
    }

    if(promises.length ==0){
        callItFinally(args);
    } else {
        Q.all(promises)
            .then(function (results) {
                callItFinally(results);
            }, function(err){
                cosole.log("Bad ",err);
            });
    }
};

function asyncCreator(errorConverter, wantFails, haveTimeout){
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
                    deferred.resolve(value);
                }
            });

            callBack.apply(null,args);
        }

        if(promises.length ==0){
            callItFinally();
            return deferred.promise;
        } else {

                Q.all(promises)
                    .then(function (results) {
                            if(!wantFails){
                                callItFinally(results);
                            }
                        },
                        function (error) {
                            if(wantFails){
                                callBack.call(null,error);
                            } else {
                                errorConverter(deferred,error);
                            }
                        }
                    );
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
                                            deferred.reject(new Error(error));
                                        }
                              );

Function.prototype.fail  =  asyncCreator(function(deferred, error){
                                            deferred.reject(new Error(error));
                                        },
                                        true
                            );


Function.prototype.timeout  =  asyncCreator(function(deferred, error){
                                            deferred.reject(new Error(error));
                                        },
                                        true, true
                                 );

