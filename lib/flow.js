/**
 * Created by ctalmacel on 25/01/16.
 */
exports.create = function(flowName,states){

    var name = flowName;
    var statesRegister = {};
    var joinsRegister = {};
    var thisFlow = this;

    this.currentState = undefined;


    function createStatesGraph() {


        function registerState(state){
            statesRegister[state] = {
                code: states[state],
                joins: []
            }
        }

        function registerJoin(join){

            joinsRegister[state] = {
                code: states[state].code,
                inputStates: {},
                parents:[]
            }


            var inStates = states[state].join.split(',');
            inStates.forEach(function (input) {
                joinsRegister[state].inputStates[input] = undefined;
            })
        }

        function joinStates(){
            for(var join in joinsRegister){
                for(var inputState in joinsRegister[join].inputStates){
                    statesRegister[inputState].joins.push(join);
                }
            }
        }

        thisFlow.begin = function(){
            var args = [];
            for(var arg in arguments){
                args.push(arguments[arg]);
            }
            thisFlow.currentState = {
                name:"begin",
                parent:"isRoot",
                args:args
            };
            states.begin.apply(thisFlow,args);
        }


        for (var state in states) {
            if (typeof states[state] === "function") {
                registerState(state);
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
        var parentState = thisFlow.currentState;

        for(var arg in arguments) {
            if(arg!="1"&&arg!="0"){
                args.push(arguments[arg]);
            }
        }

        process.nextTick(goToNextState);

        function goToNextState(){

            var nextState = {
                "parent":parentState,
                "name":stateName,
                "motivation":motivation,
                "args":args
            };
            thisFlow.currentState = nextState;

            statesRegister[stateName].code.apply(thisFlow,args);
            runJoins();

            function runJoins(){
                statesRegister[stateName].joins.forEach(runJoin);

                function runJoin(joinName){
                    var join = joinsRegister[joinName];
                    join.inputStates[nextState.name] = thisFlow.currentState;

                    join.parents.push(thisFlow.currentState);


                    var gotAllInputs = true;

                    for(var inputState in join.inputStates){
                        if(join.inputStates[inputState]==undefined) {
                            gotAllInputs = false;
                            break;
                        }
                    }

                    if(gotAllInputs){
                        thisFlow.currentState = {
                            name:joinName,
                            parents:join.parents
                        }
                        join.code.apply(thisFlow);
                        for(var inputState in join.inputStates){
                            join.inputStates[inputState]=undefined;
                        }
                        join.parents = [];
                    }
                }
            }
        }
    }

    this.continue = function(){
        var stateName = arguments["0"];
        var motivation = arguments["1"];
        var args = [];
        var parentState = thisFlow.currentState;

        for(var arg in arguments) {
            if(arg!="1"&&arg!="2"){
                args.push(arguments[arg]);
            }
        }

        return function(){
            var args = [];
            args.push(stateName);
            args.push(motivation);
            for(var arg in arguments){
                args.push(arguments[arg]);
            }
            var aux = thisFlow.currentState;
            thisFlow.currentState = parentState;
            thisFlow.next.apply(thisFlow,args);
            thisFlow.currentState = aux;
        }
    }

    return this;
}