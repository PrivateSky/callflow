/**
 * Created by ctalmacel on 25/01/16.
 */



var whys = require('../../whys/lib/why.js');

exports.create = function(flowName,states){
    return new flow(flowName,states);
}


function flow(flowName,states){

    var name = flowName;
    var activePhases = {};
    var flowStatus = "created";
    var statesRegister = {};
    var joinsRegister = {};
    var self = this;
    var currentPhase = "soemPhase";



    function attachStatesToFlow(states){

        function registerState(state){

            function makePhaseUpdates(func,stateName){
                return function() {
                    function toBeExecuted() {
                        var parentPhase = currentPhase;
                        currentPhase = stateName;
                        registerNewFunctionCall(stateName);
                        var ret = func.apply(self, mkArgs(arguments, 0));
                        makePhaseUpdatesAfterCall(stateName);
                        currentPhase = parentPhase;
                        return ret;
                    }

                    var finalFunction = toBeExecuted.why(decideMotivation(self,undefined, stateName));

                    return finalFunction.apply(self,mkArgs(arguments,0));
                }
            }

            statesRegister[state] = {
                code: states[state],
                joins: []
            }
            self[state] = addErrorTreatment(makePhaseUpdates(states[state], state));
        }

        function registerJoin(join){

            function makeJoinUpdates(func,joinName){

                function joinReady(joinName){
                    var join = joinsRegister[joinName];
                    var gotAllInputs = true;
                    for(var inputState in join.inputStates){
                        if(join.inputStates[inputState] != 0) {
                            gotAllInputs = false;
                            break;
                        }
                    }
                    return gotAllInputs;
                }

                return function(checkInputs) {
                    function toBeExecuted() {
                        if(joinsRegister[joinName].runsOnNextTick){
                            return;
                        }
                        var parentPhase = currentPhase;
                        currentPhase = joinName;
                        updateStatusBeforeCall(joinName);

                        var readyToRoll = true;

                        if(checkInputs!==undefined) {
                            joinsRegister[joinName].inputStates[parentPhase]--;
                            readyToRoll = joinReady(joinName);
                        }

                        if(readyToRoll) {
                            joinsRegister[joinName].runsOnNextTick = true;
                            process.nextTick(function() {
                                func.apply(self);
                                for (var inputState in joinsRegister[joinName].inputStates) {
                                    joinsRegister[joinName].inputStates[inputState] = -1;
                                }
                                joinsRegister[joinName].runsOnNextTick = false;
                            });
                        }

                        updateStatusAfterCall(joinName);
                        currentPhase = parentPhase;
                    }
                    function motivateCall(){
                        return currentPhase+ " to "+ joinName;
                    }
                    toBeExecuted.why(motivateCall()).apply(self,mkArgs(arguments,0));
                }
            }

            joinsRegister[join] = {
                code: states[join].code,
                inputStates: {},
                runsOnNextTick:false
            }


            var inStates = states[state].join.split(',');
            inStates.forEach(function (input) {
                input = input.trim();
                joinsRegister[join].inputStates[input] = -1;
            })

            self[join] = addErrorTreatment(makeJoinUpdates(states[join].code,join));
        }

        function joinStates(){
            for(var join in joinsRegister){
                for(var inputState in joinsRegister[join].inputStates){
                    statesRegister[inputState].joins.push(join);
                }
            }
        }

        self.error = function(error){
            var motivation = currentPhase + " failed";
            if(states['error']!==undefined) {
                states['error'].why(motivation).apply(self,[error]);
            }
            else{
                function defaultError(error){
                    console.error(self.currentPhase+ " failed");
                    console.error(error);
                }

                defaultError.why(motivation)(error);
            }
        }
        for (var state in states) {

            if(state == "error"){
                continue;
            }

            if (typeof states[state] === "function") {
                registerState(state);
            }
            else {
                registerJoin(state);
            }
        }
        joinStates();
    }

    attachStatesToFlow(states);

    this.next = function(){
        process.nextTick(this.continue.apply(this,mkArgs(arguments,0)));
    }

    function registerNewFunctionCall(stateName){

        updateStatusBeforeCall(stateName);
        notifyJoinsOfNewCall(stateName);

        function notifyJoinsOfNewCall(stateName){
            statesRegister[stateName].joins.forEach(function (join) {
                joinsRegister[join].inputStates[stateName] = (joinsRegister[join].inputStates[stateName] == -1) ? 1 : (joinsRegister[join].inputStates[stateName] + 1)
            });
        }
    }

    function getStatus(){
        return flowStatus;
    };

    function getActivePhases(){
        return activePhases;
    };

    function updateStatusBeforeCall(stateName){
        if(activePhases[stateName] ==undefined){
            activePhases[stateName] = 1;
        }else{
            activePhases[stateName]++;
        }
    }

    function updateStatusAfterCall(stateName){
        activePhases[stateName]--;

        if(activePhases[stateName] === 0){
            var done = true;
            for(var phase in activePhases){
                if(activePhases[phase] > 0){
                    done = false;
                    break;
                }
            }
            if(done){
                flowStatus = "done";
            }
        }
    }

    function makePhaseUpdatesAfterCall(stateName){
        updateJoinsAfterCall(stateName);
        updateStatusAfterCall(stateName);


        function updateJoinsAfterCall(stateName){
            statesRegister[stateName].joins.forEach(function (joinName) {
                self[joinName]("check inputs before calling");
            });
        };
    }

    this.continue = function(){
        var stateName = arguments[0];
        var motivation = arguments[1];

        motivation = decideMotivation(self,motivation, stateName);
        registerNewFunctionCall(stateName);

        return addErrorTreatment(function(){
            currentPhase = stateName;
            statesRegister[stateName].code.apply(self, mkArgs(arguments,0));
            makePhaseUpdatesAfterCall(stateName);
        }.why(motivation));
    };

    return function(){
        flowStatus = "running";
        self.begin.apply(self, mkArgs(arguments, 0));
        return self;
    }
}

function decideMotivation(flow, motivation, stateName){
    if(motivation === undefined){
        if(flow.currentPhase){
            motivation = "***Transition between flow phases:" + flow.currentPhase+" to " + stateName;
        } else {
            motivation = "***Starting flow: " + flow.name;
        }
    }
    return motivation;
}

function mkArgs(args,pos){
    var argsArray = [];
    for(var i=pos;i<args.length;i++){
        argsArray.push(args[i]);
    }
    return argsArray;
}

function addErrorTreatment(func){
    return function(){
        try{
            return func.apply(this,mkArgs(arguments,0));
        }
        catch(error){
            console.log("Catched an error");
            this.flowStatus = "failed";
            return this.error(error);
        }
    }
}
