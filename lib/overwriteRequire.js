
/*
 require and requireLibrary are overwriting the node.js defaults in loading modules for increasing security and speed.
 We guarantee that each module or library is loaded only once and only from a single folder... Use the standard require if you need something else!

 */

if(typeof(global.$$) == "undefined") {
    global.$$ = {};
}

console.log("Booting...");
var weAreInbrowser = (typeof($$.browserRuntime) != "undefined");


var pastRequests = {};
function preventRecursiveRequire(request){
    if(pastRequests[request]){
        var err = new Error("Preventing recursive require for " + request);
        err.type = "PSKIgnorableError"
        throw err;
    }

}

function disableRequire(request){
    pastRequests[request] = true;
}

function enableRequire(request){
    pastRequests[request] = false;
}


function requireFromCache(request){
    var existingModule = $$.__runtimeModules[request];
    return  existingModule;
}

function tryRequireSequence(arr, request){

    preventRecursiveRequire(request);
    disableRequire(request);
    var result;
    for(var i = 0; i < arr.length; i++){
        try{
            result = arr[i](request);
            if(result != undefined){
                //console.log("returning result for ", request, !!result);
                $$.__runtimeModules[request] = result;
                break;
            }
        } catch(err){
            if(err.type != "PSKIgnorableError"){
                console.log("Failed in step", i, request, err);
            }
        }
    }

    if(!result){
        console.log("Failed to load module ", request, result);
    }

    enableRequire(request);
    return result;
}


if (typeof($$.require) == "undefined") {
    $$.__runtimeModules = {};

    if (!weAreInbrowser) {  //we are in node

        $$.__runtimeModules["crypto"] = require("crypto");
        $$.__runtimeModules["util"] = require("util");

        console.log("Redefining require for node");
        var Module = require('module');
        $$.__originalRequire = Module._load;

        function newLoader(request) {
            //preventRecursiveRequire(request);

            var self = this;
            function originalRequire(...args){
                return $$.__originalRequire.apply(self,args);
            }

            return tryRequireSequence([requireFromCache, pskruntimeRequire, originalRequire], request);
        }

        Module._load = newLoader;

    } else {
        console.log("Defining global require in browser");

        window.require = function(request){

            return tryRequireSequence([requireFromCache, browserRequire, pskruntimeRequire], request);
        }
    }

    $$.require = require;
}
