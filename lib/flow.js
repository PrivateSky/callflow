/**
 * Created by ctalmacel on 25/01/16.
 */
exports.create = function(flowName,states){

    var name = flowName;
    var statesRegister = {};
    var joinsRegister = {};
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

        function wrapFunction(functionName,code){
            thisFlow[functionName] = function(){
                var args = [];
                for(var arg in arguments){
                    args.push(arguments[arg]);
                }
                code.apply(thisFlow,args);
                runJoins(functionName);
            }
        }


        for (var state in states) {
            if (typeof states[state] === "function") {
                registerState(state);
                wrapFunction(state,states[state]);
            }
            else {
                registerJoin(state);
            }
        }

        joinStates();
    }

    createStatesGraph();

    this.next = function() {

        var stateName = arguments["0"];
        var motivation = arguments["1"];

        var args = [];

        for(var arg in arguments) {
            if(arg!="0"&&arg!="1"){
                args.push(arguments[arg]);
            }
        }

        process.nextTick(function(){
            thisFlow[stateName].apply(thisFlow,args);
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

        for(var arg in arguments) {
            if(arg!="1"&&arg!="2"){
                args.push(arguments[arg]);
            }
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
            thisFlow[stateName].apply(thisFlow,args);
        }
    }





    return this;
}