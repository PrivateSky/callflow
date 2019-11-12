
//var path = require("path");
function defaultErrorHandlingImplementation(err, res){
	//console.log(err.stack);
	if(err) throw err;
	return res;
}

require("./lib/overwriteRequire");
/*
const PSKBuffer = require('pskbuffer');
$$.PSKBuffer = PSKBuffer; */


$$.__intern = {
        mkArgs:function(args,pos){
            var argsArray = [];
            for(var i = pos; i < args.length; i++){
                argsArray.push(args[i]);
            }
            return argsArray;
        }
    };


$$.defaultErrorHandlingImplementation = defaultErrorHandlingImplementation;

var callflowModule = require("./lib/swarmDescription");
$$.callflows        = callflowModule.createSwarmEngine("callflow");
$$.callflow         = $$.callflows;
$$.flow             = $$.callflows;
$$.flows            = $$.callflows;


$$.PSK_PubSub = require("soundpubsub").soundPubSub;

$$.securityContext = "system";
$$.libraryPrefix = "global";
$$.libraries = {
    global:{

    }
};

$$.interceptor = require("./lib/InterceptorRegistry").createInterceptorRegistry();

$$.loadLibrary = require("./lib/loadLibrary").loadLibrary;

requireLibrary = function(name){
    //var absolutePath = path.resolve(  $$.__global.__loadLibraryRoot + name);
    return $$.loadLibrary(name,name);
};

require("./constants");


$$.pathNormalize = function (pathToNormalize) {
    const path = require("path");
    pathToNormalize = path.normalize(pathToNormalize);

    return pathToNormalize.replace(/[\/\\]/g, path.sep);
};

// add interceptors

const crypto = require('crypto');

$$.interceptor.register('*', '*', 'before', function () {
    const swarmTypeName = this.getMetadata('swarmTypeName');
    const phaseName = this.getMetadata('phaseName');
    const swarmId = this.getMetadata('swarmId');
    const executionId = crypto.randomBytes(16).toString('hex');

    this.setMetadata('executionId', executionId);

    $$.event('swarm.call', {swarmTypeName, phaseName, swarmId});
});


module.exports = {
    				createSwarmEngine: require("./lib/swarmDescription").createSwarmEngine,
                    createJoinPoint: require("./lib/parallelJoinPoint").createJoinPoint,
                    createSerialJoinPoint: require("./lib/serialJoinPoint").createSerialJoinPoint,
                    //swarmInstanceManager: require("./lib/choreographies/swarmInstancesManager"),
                    enableInternalSwarmRouting: function(){
                        function dummyVM(name){
                            function solveSwarm(swarm){
                                $$.swarmsInstancesManager.revive_swarm(swarm);
                            }

                            $$.PSK_PubSub.subscribe(name, solveSwarm);
                            console.log("Creating a fake execution context...");
                        }
                        dummyVM($$.CONSTANTS.SWARM_FOR_EXECUTION);
                    },
                    createStandardAPIsForSwarms:require("./lib/utilityFunctions/base").createForObject
				};


require("../choreo");