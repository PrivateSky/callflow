var beesHealer = require("./beesHealer");
var swarmDebug = require("./SwarmDebug");


exports.createForObject = function(valueObject, thisObject, localId){
    var ret = {};

    function filterForSerialisable (valueObject){
        return valueObject.meta.swarmId;
    }

    function getInnerValue(){
        return valueObject;
    }

    function runPhase(functName, args){
        var func = valueObject.myFunctions[functName];
        if(func){
            func.apply(thisObject, args);
        } else {
            $$.errorHandler.syntaxError(functName, valueObject, "Function " + functName + " does not exist!");
        }
    }

    function update(serialisation){
        beesHealer.jsonToNative(serialisation,valueObject);
    }

    function valueOf(){
        var ret = {};
        ret.meta                = valueObject.meta;
        ret.publicVars          = valueObject.publicVars;
        ret.privateVars         = valueObject.privateVars;
        ret.protectedVars       = valueObject.protectedVars;
        return ret;
    }

    function toString (){
        return swarmDebug.cleanDump(thisObject.valueOf());
    }

    function createParallel(callback){
        return require("./parallelJoinPoint").createJoinPoint(thisObject, callback, $$.__intern.mkArgs(arguments,1));
    }

    function createSerial(callback){
        return require("./serialJoinPoint").createSerialJoinPoint(thisObject, callback, $$.__intern.mkArgs(arguments,1));
    }

    function inspect(){
        return swarmDebug.cleanDump(thisObject.valueOf());
    }

    function constructor(){
        return SwarmDescription;
    }

    function ensureLocalId(){
        if(!valueObject.localId){
            valueObject.localId = valueObject.meta.swarmTypeName + "-" + localId;
            localId++;
        }
    }

    function observe(callback, waitForMore, filter){
        if(!waitForMore){
            waitForMore = function (){
                return false;
            }
        }

        ensureLocalId();

        $$.PSK_PubSub.subscribe(valueObject.localId, callback, waitForMore, filter);
    }

    function toJSON(prop){
        //preventing max call stack size exceeding on proxy auto referencing
        //replace {} as result of JSON(Proxy) with the string [Object protected object]
        return "[Object protected object]";
    }

    function getJSONasync(callback){
        //make the execution at level 0  (after all pending events) and wait to have a swarmId
        ret.observe(function(){
            beesHealer.asJSON(valueObject, null, null,callback);
        },null,filterForSerialisable);
        ret.notify();
    }

    function notify(event){
        if(!event){
            event = valueObject;
        }
        ensureLocalId();
        $$.PSK_PubSub.publish(valueObject.localId, event);
    }

    ret.notify          = notify;
    ret.getJSONasync    = getJSONasync;
    ret.toJSON          = toJSON;
    ret.observe         = observe;
    ret.inspect         = inspect;
    ret.join            = createParallel;
    ret.parallel        = createParallel;
    ret.serial          = createSerial;
    ret.valueOf         = valueOf;
    ret.update          = update;
    ret.runPhase        = runPhase;
    ret.getInnerValue   = getInnerValue;
    ret.toString        = toString;
    ret.constructor     = constructor;

    return ret;
};