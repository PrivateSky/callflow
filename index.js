
//var path = require("path");

function defaultErrorHandlingImplementation(err, res){
	//console.log(err.stack);
	if(err) throw err;
	return res;
}

require("./lib/overwriteRequire");



$$.errorHandler = {
        error:function(err, args, msg){
            console.log(err, "Unknown error from function call with arguments:", args, "Message:", msg);
        },
        throwError:function(err, args, msg){
            console.log(err, "Unknown error from function call with arguments:", args, "Message:", msg);
            throw err;
        },
        ignorePossibleError: function(name){
            console.log(name);
        },
        syntaxError:function(property, swarm, text){
            //throw new Error("Misspelled member name or other internal error!");
            var swarmName;
            try{
                if(typeof swarm == "string"){
                    swarmName = swarm;
                } else
                if(swarm && swarm.meta){
                    swarmName  = swarm.meta.swarmTypeName;
                } else {
                    swarmName = swarm.getInnerValue().meta.swarmTypeName;
                }
            } catch(err){
                swarmName = err.toString();
            }
            if(property){
                console.log("Wrong member name ", property,  " in swarm ", swarmName);
                if(text) {
                    console.log(text);
                }
            } else {
                console.log("Unknown swarm", swarmName);
            }

        },
        warning:function(msg){
            console.log(msg);
        }
    };

$$.uidGenerator = require("./lib/safe-uuid");

$$.safeErrorHandling = function(callback){
        if(callback){
            return callback;
        } else{
            return defaultErrorHandlingImplementation;
        }
    };

$$.__intern = {
        mkArgs:function(args,pos){
            var argsArray = [];
            for(var i = pos; i < args.length; i++){
                argsArray.push(args[i]);
            }
            return argsArray;
        }
    };



var swarmUtils = require("./lib/choreographies/utilityFunctions/swarm");

$$.defaultErrorHandlingImplementation = defaultErrorHandlingImplementation;

var callflowModule = require("./lib/swarmDescription");
$$.callflows        = callflowModule.createSwarmEngine("callflow");
$$.callflow         = $$.callflows;
$$.flow             = $$.callflows;
$$.flows            = $$.callflows;

$$.swarms           = callflowModule.createSwarmEngine("swarm", swarmUtils);
$$.swarm            = $$.swarms;
$$.contracts        = callflowModule.createSwarmEngine("contract", swarmUtils);
$$.contract         = $$.contracts;


$$.PSK_PubSub = require("soundpubsub").soundPubSub;

$$.securityContext = "system";
$$.libraryPrefix = "global";
$$.libraries = {
    global:{

    }
};



$$.loadLibrary = require("./lib/loadLibrary").loadLibrary;

requireLibrary = function(name){
    //var absolutePath = path.resolve(  $$.__global.__loadLibraryRoot + name);
    return $$.loadLibrary(name,name);
};

$$.registerSwarmDescription =  function(libraryName,shortName, description){
    if(!$$.libraries[libraryName]){
        $$.libraries[libraryName] = {};
    }
    $$.libraries[libraryName][shortName] = description;
    $$.__global.requireLibraries[shortName] = libraryName + "." + shortName;

}

module.exports = {
    				createSwarmEngine: require("./lib/swarmDescription").createSwarmEngine,
                    createJoinPoint: require("./lib/parallelJoinPoint").createJoinPoint,
                    createSerialJoinPoint: require("./lib/serialJoinPoint").createSerialJoinPoint,
					"safe-uuid": require("./lib/safe-uuid"),
                    swarmInstanceManager: require("./lib/choreographies/swarmInstancesManager")
				};