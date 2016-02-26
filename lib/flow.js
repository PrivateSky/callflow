/**
 * Created by ctalmacel on 25/01/16.
 */



var whys = require('../../whys/lib/why.js');

exports.create = function(flowName,states){
    return new flow(flowName,states);
}


function flow(flowName,states){

    this.name = flowName;
    this.activePhases = {};
    this.flowStatus = "created";
    this.statesRegister = {};
    this.joinsRegister = {};

    var self = this;

    this.attachStatesToFlow(states);


    return function(){
        self.flowStatus = "running";
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

flow.prototype.next = function() {
    var stateName = arguments[0];
    var motivation = arguments[1];
    var self = this;

    motivation = decideMotivation(this,motivation, stateName);
    var args = mkArgs(arguments,2);
    this.registerNewFunctionCall(stateName);

    process.nextTick(self.addErrorTreatment(function() {
        self.currentPhase = stateName;
        self.statesRegister[stateName].code.apply(self, args);
        self.makePhaseUpdatesAfterCall(stateName);
    }.why(motivation)));
}

flow.prototype.continue = function(){
    var stateName = arguments[0];
    var motivation = arguments[1];
    var self = this;
    motivation = decideMotivation(this,motivation, stateName);

    self.registerNewFunctionCall(stateName);
    var args = mkArgs(arguments,2);
    return self.addErrorTreatment(function(){
        self.currentPhase = stateName;
        self.statesRegister[stateName].code.apply(self, mkArgs(arguments,0));
        self.makePhaseUpdatesAfterCall(stateName);
    }.why(motivation));
};

flow.prototype.getStatus = function(){
    return this.flowStatus;
};

flow.prototype.getActivePhases = function(){
    return this.activePhases;
};

flow.prototype.addErrorTreatment = function(func){
    var self = this;
    return function(){
        try{
            return func.apply(this,mkArgs(arguments,0));
        }
        catch(error){
            console.log("Catched an error");
            self.flowStatus = "failed";
            return self.error(error);
        }
    }
}

flow.prototype.updateStatusBeforeCall = function(stateName){
    if(this.activePhases[stateName] ==undefined){
        this.activePhases[stateName] = 1;
    }else{
        this.activePhases[stateName]++;
    }
}

flow.prototype.updateStatusAfterCall = function(stateName){
    this.activePhases[stateName]--;

    if(this.activePhases[stateName] === 0){
        var done = true;
        for(var phase in this.activePhases){
            if(this.activePhases[phase] > 0){
                done = false;
                break;
            }
        }
        if(done){
            this.flowStatus = "done";
        }
    }
}

flow.prototype.registerNewFunctionCall = function(stateName){

    this.updateStatusBeforeCall(stateName);
    var self = this;
    notifyJoinsOfNewCall(stateName);

    function notifyJoinsOfNewCall(stateName){
        //register function call in joins
        self.statesRegister[stateName].joins.forEach(function (join) {
            self.joinsRegister[join].inputStates[stateName] = (self.joinsRegister[join].inputStates[stateName] == -1) ? 1 : (self.joinsRegister[join].inputStates[stateName] + 1)
        });
    }
}

flow.prototype.makePhaseUpdatesAfterCall = function(stateName){
    var self = this;

    updateJoinsAfterCall(stateName);
    this.updateStatusAfterCall(stateName);


    function updateJoinsAfterCall(stateName){
        self.statesRegister[stateName].joins.forEach(function (joinName) {
                self[joinName]("check inputs before calling");
        });
    };
}

flow.prototype.attachStatesToFlow = function(states){

    var self = this;

    function registerState(state){

        function makePhaseUpdates(func,stateName){
            return function() {
                function toBeExecuted() {
                    var parentPhase = self.currentPhase;
                    self.currentPhase = stateName;
                    self.registerNewFunctionCall(stateName);
                    var ret = func.apply(self, mkArgs(arguments, 0));
                    self.makePhaseUpdatesAfterCall(stateName);
                    self.currentPhase = parentPhase;
                    return ret;
                }

                var finalFunction = toBeExecuted.why(decideMotivation(self,undefined, stateName));

                return finalFunction.apply(self,mkArgs(arguments,0));
            }
        }

        self.statesRegister[state] = {
            code: states[state],
            joins: []
        }
        self[state] = self.addErrorTreatment(makePhaseUpdates(states[state], state));
        console.log();
    }

    function registerJoin(join){

        function makeJoinUpdates(func,joinName){

            function joinReady(joinName){
                var join = self.joinsRegister[joinName];
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
                    if(self.joinsRegister[joinName].runsOnNextTick){
                        return;
                    }
                    var parentPhase = self.currentPhase;
                    self.currentPhase = joinName;
                    self.updateStatusBeforeCall(joinName);

                    var readyToRoll = true;

                    if(checkInputs!==undefined) {
                        self.joinsRegister[joinName].inputStates[parentPhase]--;
                        readyToRoll = joinReady(joinName);
                    }

                    if(readyToRoll) {
                        self.joinsRegister[joinName].runsOnNextTick = true;
                        process.nextTick(function() {
                            func.apply(self);
                            for (var inputState in self.joinsRegister[joinName].inputStates) {
                                self.joinsRegister[joinName].inputStates[inputState] = -1;
                            }
                            self.joinsRegister[joinName].runsOnNextTick = false;
                        });
                    }

                    self.updateStatusAfterCall(joinName);
                    self.currentPhase = parentPhase;
                }
                function motivateCall(){
                    return self.currentPhase+ " to "+ joinName;
                }
                toBeExecuted.why(motivateCall()).apply(self,mkArgs(arguments,0));
            }
        }


        self.joinsRegister[join] = {
            code: states[join].code,
            inputStates: {},
            runsOnNextTick:false
        }


        var inStates = states[state].join.split(',');
        inStates.forEach(function (input) {
            input = input.trim();
            self.joinsRegister[join].inputStates[input] = -1;
        })

        self[join] = self.addErrorTreatment(makeJoinUpdates(states[join].code,join));
    }

    function joinStates(){
        for(var join in self.joinsRegister){
            for(var inputState in self.joinsRegister[join].inputStates){
                self.statesRegister[inputState].joins.push(join);
            }
        }
    }

    function defaultError(error){
        console.error(self.currentPhase+ " failed");
        console.error(error);
    }
    this.error = function(error){
        var motivation = self.currentPhase + " failed";
        if(states['error']!==undefined) {
            states['error'].why(motivation).apply(self,[error]);
        }
        else{
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

function mkArgs(args,pos){
    var argsArray = [];
    for(var i=pos;i<args.length;i++){
        argsArray.push(args[i]);
    }
    return argsArray;
}
