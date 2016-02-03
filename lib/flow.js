/**
 * Created by ctalmacel on 25/01/16.
 */
exports.create = function(flowName, states){

    var name = flowName;
    var statesRegister = {};
    var joinsRegister = {};
    this.joinsss = joinsRegister;
    var thisFlow = this;

    function createStatesGraph() {

        function registerState(state){
            statesRegister[state] = {
                code: states[state],
                joins: []
            }
        }

        function registerJoin(join){

            joinsRegister[join] = {
                code: states[join].code,
                inputStates: {}
            }


            var inStates = states[state].join.split(',');
            inStates.forEach(function (input) {
                joinsRegister[join].inputStates[input] = -1;
            })
        }

        function joinStates(){
            for(var join in joinsRegister){
                for(var inputState in joinsRegister[join].inputStates){
                    statesRegister[inputState].joins.push(join);
                }
            }
        }

        function attachFunctionForDirectCall(stateName,code){
            thisFlow[stateName] = function(){
                var args = [];
                for(var arg in arguments){
                    args.push(arguments[arg]);
                }
                statesRegister[stateName].joins.forEach(function(join){
                    joinsRegister[join].inputStates[stateName] = (joinsRegister[join].inputStates[stateName]==-1)? 1:(joinsRegister[join].inputStates[stateName]+1)
                })
                code.apply(thisFlow,args);
                runJoins(stateName);
            }
        }

        for (var state in states) {
            if (typeof states[state] === "function") {
                registerState(state);
                attachFunctionForDirectCall(state,states[state]);
            }
            else {
                registerJoin(state);
            }
        }

        joinStates();
    }

    createStatesGraph();

    this.next = function() {

        var stateName = arguments[0];
        var motivation = arguments[1];

        var args = [];

        for(var i = 2; i< arguments.length; i++) {
                args.push(arguments[i]);
        }

        process.nextTick(function(){
            statesRegister[stateName].code.apply(thisFlow,args);
            runJoins(stateName);
        });

        statesRegister[stateName].joins.forEach(function(join){
            joinsRegister[join].inputStates[stateName] = (joinsRegister[join].inputStates[stateName]==-1)? 1:(joinsRegister[join].inputStates[stateName]+1)
        });
    }

    function runJoins(parentState){
        statesRegister[parentState].joins.forEach(runJoin);

        function runJoin(joinName){
            var join = joinsRegister[joinName];
            if(join.inputStates[parentState] == -1){
                join.inputStates[parentState] = 0;
            }
            else{
                if(join.inputStates[parentState] !== 0) {
                    join.inputStates[parentState]--;
                }
            }

            var gotAllInputs = true;
            for(var inputState in join.inputStates){
                if(join.inputStates[inputState] != 0) {
                    gotAllInputs = false;
                    break;
                }
            }

            if(gotAllInputs){
                for(var inputState in join.inputStates){
                    join.inputStates[inputState] = -1;
                }
                join.code.apply(thisFlow);
            }
        }
    }


    this.continue = function(){
        var stateName = arguments["0"];
        var motivation = arguments["1"];
        var args = [];

        for(var i = 2; i< arguments.length; i++) {
            args.push(arguments[i]);
        }


        statesRegister[stateName].joins.forEach(function(join){
            joinsRegister[join].inputStates[stateName] = (joinsRegister[join].inputStates[stateName]==-1)? 1:(joinsRegister[join].inputStates[stateName]+1)
        })

        return function(){
            var args = [];
            args.push(stateName);
            for(var arg in arguments){
                args.push(arguments[arg]);
            }
            statesRegister[stateName].code.apply(thisFlow,args);
            runJoins(stateName);
        }
    }

    return this.begin;
}