/**
 * Created by ctalmacel on 25/01/16.
 */

var doubleCheck = require('double-check');

/*
+integrate with whys
+refactor making args           -- done
+begin returns this             -- done
+need to know the current status-- in progress
+finish the error thing         -- done
 */


/*
    in status:
        - fazele care sunt in asteptare
        - pornit ,rulare sau terminat,failed
*/
exports.create = function(flowName, states){
    var activePhases = {};
    var name = flowName;
    var statesRegister = {};
    var joinsRegister = {};
    var thisFlow = this;



    function mkArgs(args,pos){
        var argsArray = [];
        for(var i=pos;i<args.length;i++){
            argsArray.push(args[i]);
        }
        return argsArray;
    }

    function addErrorTreatment(func){

        if(thisFlow.error === undefined){
            return func;
        }

        return function(){
            try{
                return func.apply(thisFlow,mkArgs(arguments,0));
            }
            catch(error){
                return thisFlow.error(error);
            }
        }
    }


    function notifyJoinsOfNewCall(stateName){
        //register function call in joins
        statesRegister[stateName].joins.forEach(function (join) {
            joinsRegister[join].inputStates[stateName] = (joinsRegister[join].inputStates[stateName] == -1) ? 1 : (joinsRegister[join].inputStates[stateName] + 1)
        });
    }

    function updateJoinsAfterCall(stateName){
        //update joins and trigger them if neccesary
        statesRegister[stateName].joins.forEach(triggerJoin);

        function triggerJoin(joinName) {

            function checkJoinInputs(joinName){
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

            function runJoin(joinName){
                var join = joinsRegister[joinName];
                for (var inputState in join.inputStates) {
                    join.inputStates[inputState] = -1;
                }
                join.code.apply(thisFlow);
            }

            function updateJoinStatus(joinName,parentState){
                joinsRegister[joinName].inputStates[parentState]--;
            }


            updateJoinStatus(joinName, stateName);
            if (checkJoinInputs(joinName)) {
                runJoin(joinName);
            }
        }
    }

    function attachStatesToFlow() {

        function addJoinTreatment(func,stateName){

            return function() {

                notifyJoinsOfNewCall(stateName);

                var ret = func.apply(thisFlow,mkArgs(arguments,0));

                updateJoinsAfterCall(stateName);

                return ret;

            }
        }

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


        thisFlow.error = states['error'];

        for (var state in states) {

            if(state == "error"){
                continue;
            }

            if (typeof states[state] === "function") {
                registerState(state);
                if(state == 'begin'){
                    thisFlow['begin'] = addErrorTreatment(addJoinTreatment(function(){
                        states['begin'].apply(thisFlow,mkArgs(arguments,0));
                        return thisFlow;
                    },'begin'))
                }
                else {
                    thisFlow[state] = addErrorTreatment(addJoinTreatment(states[state], state));
                }
            }
            else {
                registerJoin(state);
                thisFlow[state] = addErrorTreatment(states[state].code);
            }
        }
        joinStates();


        if(thisFlow.error === undefined){
            //doubleCheck.logger.('Flow does not treat errors!')
            console.log('Flow does not treat errors!');
        }
    }

    this.next = addErrorTreatment(function() {

        var stateName = arguments[0];
        var motivation = arguments[1];
        var args = mkArgs(arguments,2);


        notifyJoinsOfNewCall(stateName);

        process.nextTick(addErrorTreatment(function() {
            statesRegister[stateName].code.apply(thisFlow, args);
            updateJoinsAfterCall(stateName);
        }));

    })

    this.continue = addErrorTreatment(function(){
        var stateName = arguments[0];
        var motivation = arguments[1];
        var args = mkArgs(arguments,2);


        notifyJoinsOfNewCall(stateName);

        return addErrorTreatment(function(){
                var args = mkArgs(arguments,0);
                statesRegister[stateName].code.apply(thisFlow, args);
                updateJoinsAfterCall(stateName);
        });
    });


    attachStatesToFlow();

    return this.begin;
}