/*
 require and $$.require are overwriting the node.js defaults in loading modules for increasing security,speed and making it work to the privatesky runtime build with browserify.
 The privatesky code for domains should work in node and browsers.
 */


if (typeof(window) !== "undefined") {
    global = window;
}


if (typeof(global.$$) == "undefined") {
    global.$$ = {};
    $$.__global = {};
}

if (typeof($$.__global) == "undefined") {
    $$.__global = {};
}

if (typeof($$.__global.requireLibrariesNames) == "undefined") {
    $$.__global.currentLibraryName = null;
    $$.__global.requireLibrariesNames = {};
}


if (typeof($$.__runtimeModules) == "undefined") {
    $$.__runtimeModules = {};
}


if (typeof(global.functionUndefined) == "undefined") {
    global.functionUndefined = function () {
        console.log("Called of an undefined function!!!!");
        throw new Error("Called of an undefined function");
    }
    if (typeof(global.webshimsRequire) == "undefined") {
        global.webshimsRequire = global.functionUndefined;
    }

    if (typeof(global.domainRequire) == "undefined") {
        global.domainRequire = global.functionUndefined;
    }

    if (typeof(global.pskruntimeRequire) == "undefined") {
        global.pskruntimeRequire = global.functionUndefined;
    }
}

if (typeof($$.log) == "undefined") {
    $$.log = function (...args) {
        console.log(args.join(" "));
    }
}


var weAreInbrowser = (typeof($$.browserRuntime) != "undefined");


var pastRequests = {};

function preventRecursiveRequire(request) {
    if (pastRequests[request]) {
        var err = new Error("Preventing recursive require for " + request);
        err.type = "PSKIgnorableError"
        throw err;
    }

}

function disableRequire(request) {
    pastRequests[request] = true;
}

function enableRequire(request) {
    pastRequests[request] = false;
}


function requireFromCache(request) {
    var existingModule = $$.__runtimeModules[request];
    return existingModule;
}

function wrapStep(callbackName) {
    var callback = global[callbackName];
    if (callback == undefined) {
        return null;
    }

    if (callback === global.functionUndefined) return null;

    return function (request) {
        var result = callback(request);
        $$.__runtimeModules[request] = result;
        return result;
    }
}

function tryRequireSequence(originalRequire, request) {
    var arr;
    if (originalRequire) {
        arr = $$.__requireFunctionsChain.slice();
        arr.push(originalRequire);
    } else {
        arr = $$.__requireFunctionsChain;
    }
    preventRecursiveRequire(request);
    disableRequire(request);
    var result;
    var previousRequire = $$.__global.currentLibraryName;
    var previousRequireChanged = false;

    if (!previousRequire) {
        // console.log("Loading library for require", request);
        $$.__global.currentLibraryName = request;

        if (typeof $$.__global.requireLibrariesNames[request] == "undefined") {
            $$.__global.requireLibrariesNames[request] = {};
            //$$.__global.requireLibrariesDescriptions[request]   = {};
        }
        previousRequireChanged = true;
    }
    for (var i = 0; i < arr.length; i++) {
        var func = arr[i];
        try {

            if (func === global.functionUndefined) continue;
            result = func(request);
            if (result) {
                //console.log("returning result for ", request, !!result);
                break;
            }
        } catch (err) {
            if (err.type != "PSKIgnorableError") {
                $$.log("Require encounted an error while loading ", request, "\nCause:\n", err.stack);
            }
        }
    }

    if (!result) {
        $$.log("Failed to load module ", request, result);
    }

    enableRequire(request);
    if (previousRequireChanged) {
        //console.log("End loading library for require", request, $$.__global.requireLibrariesNames[request]);
        $$.__global.currentLibraryName = null;
    }
    return result;
}

if (typeof($$.require) == "undefined") {

    $$.__requireList = ["webshimsRequire", "pskruntimeRequire"];
    $$.__requireFunctionsChain = [];

    $$.requireBundle = function (name) {
        name += "Require";
        $$.__requireList.push(name);
        var arr = [requireFromCache];
        $$.__requireList.forEach(function (item) {
            var callback = wrapStep(item);
            if (callback) {
                arr.push(callback);
            }
        })

        $$.__requireFunctionsChain = arr;
    }

    $$.requireBundle("init");

    if (!weAreInbrowser) {  //we are in node
        var path = require("path");
        $$.__runtimeModules["crypto"] = require("crypto");
        $$.__runtimeModules["util"] = require("util");

        var Module = require('module');
        $$.__runtimeModules["module"] = Module;

        $$.log("Redefining require for node");

        //$$.__originalRequire = Module._load;
        var moduleOriginalRequire = Module.prototype.require;

        function newLoader(request) {
            // console.log("newLoader:", request);
            //preventRecursiveRequire(request);
            var self = this;

            function originalRequire(...args) {
                //return $$.__originalRequire.apply(self,args);
                //return Module._load.apply(self,args)
                var res;
                try {
                    res = moduleOriginalRequire.apply(self, args);
                } catch (err) {
                    if (err.code == "MODULE_NOT_FOUND") {
                        var p = path.join(process.cwd(), request)
                        res = moduleOriginalRequire.apply(self, [p]);
                        request = p;
                    } else {
                        throw err;
                    }
                }
                return res;
            }

            function currentFolderRequire(request) {
                return
            }

            //[requireFromCache, wrapStep(pskruntimeRequire), wrapStep(domainRequire), originalRequire]
            return tryRequireSequence(originalRequire, request);
        }

        Module.prototype.require = newLoader;
    } else {
        $$.log("Defining global require in browser");


        global.require = function (request) {

            ///*[requireFromCache, wrapStep(webshimsRequire), , wrapStep(pskruntimeRequire), wrapStep(domainRequire)*]
            return tryRequireSequence(null, request);
        }
    }

    $$.require = require;
}
