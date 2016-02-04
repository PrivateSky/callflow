#asynchron flows

### This library purpose a concept of flow based on explicit continuations. 
    
    The idea of the library is to represent asynchronous code (or even synchronous but complex code) as a set pf phases in a workflow. 
    The code using asynchron avoids the infamous pyramid of callbacks by structuring code in a list of functions (phases) that also control the transitions between phases using "next" and "continue" primitives.
    Transitions between  phases can get triggered by directly calls to other phases, by asynchronous calls (next) and by a continuations given in place of a asynchronous callback.
    The flows have also the concept of "join" that  are dormant phases that get called only when th whole list of declared phases got executed.
        

### Syntax & primitives: The syntax of a flow is a JSON with values as functions phases and join phases 

    The flow can be seen as a set of phases and the computation will pass through each one (synchronously and asynchronously)
    Each phase has a name. Phases can be function phases or join phases. If a phase is a function phase, the field value in the JSON is a function. 
    If a phase is a join phase, the value of the field is an object with a member "join" containing a list with the names of the phases that are waited until the join phase get called (see examples).
    Two special functions, called flow primitives, are available in all   
    
### Flow variables     

    When a flow is created, a Java Script object is created. This object beside containing as members all the functions of the flow, the "next" and "continue" functions, it can also contain arbitrary variables.
    
    
### Basic example:
    
      vaf flow = require("asynchron");
      var f = flow.createFlow("Flow example", {
            begin:function(a1,a2){
                //.. code
                this.variable = false;
                this.step();
            },
            step:function(a){
                //this.variable is set in begin
                //.. code     
                        
            }
        });
        f();


### Example with a join and use of continue:
         
      var f = flow.createFlow("Flow example", {
            begin:function(a1,a2){
                //..
                this.step(true);
                this.next("step", "Comment explaining why was this function called", true); // quite similar with this.step(true) but step wll be executed at nextTick   
                
                asyncFunction(this.continue("callback","Called later by asyncFunction");
            },
            step:function(a){
                //a will be true in both cases
                //..code
                
            }
            callback:function(err,res){
                            //..
                
            }
            end:{
                join:"step,callback", //waits 2 calls of step and one of callback
                code:function(){
                //..called     
            }            
        });
        var flow = f();
        f.status(); // see the flow status
    

###   Integration with the "whys" module (https://github.com/salboaie/whys)

 From the beginning, we created flows with the idea to have automated integration with the "whys" module. Each phase transitions is automatically logged with a "why" call explaining the transition.  
 Beside automated integration, why calls can be performed at will anywhere and the why system will compact the tracking logs for each call.
 "next" and "continue" functions have the second argument an string that is automatically passed to the why.
 
      vaf flow = require("asynchron");
           var f = flow.createFlow("Flow example", {
                 begin:function(a1,a2){
                     //.. code
                     this.step.why("explanantions...")();                     
                 }.why("Additional info"),
                 step:function(a){
                     //.. code                
                 }.why("Additional info")
             });
             f.why("Additional info")();

###   Other tips and tricks
 






# OBSOLETE FUNCTIONALITIES FOR async/wait pattern. Still working for old projects but These days, the recomened method in SwarmESB based projects of handlng asynchrnous code is with flows 
Very small library that add the wait, async pattern to promises in Java Script (currently we are using Q library).

    Asinchron provides syntactic sugar on promises APIs to clean the code but it is also very important for swarm project (especially for SwarmCore)
    It is mandatory to use asynchron module when working with swarm phases.
By using swait, the swarm runtime can track execution contexts to handle security, multi-tenancy, handle errors properly,etc.
 of coyrse, asynchron can be also used outside of swarm projects.

## Installation:

> npm install asynchron


## Example 1: reading the content of a file

        var myFileContent = fs.readFile.async("fileName.txt");
        (function(content){
            console.log(content);
        }).wait(myFileContent);

        //myFileContent is a Q promise and you can do other Q things with that promise

## Example 2:

> For example, we have 2 functions (asynchronous APIs for dealing with penguins), using node.js return convention


        loadPenguin(nickName, callBack)
        loadPenguinFamily(father, mother, callBack)

> now, let's see how we load some Penguins

        var father = loadPenguin.async('MrPenguin');
        var mother = loadPenguin.async('MrsPenguin');
        var family = loadPenguinFamily.async(father, mother);

        (function (family){
            console.log(family); //whatever
        }).wait(family);

##  Simple functions (all added in Function.prototype for better syntax):

### wait(<list of variables>)

    functionReference.wait(...)

>   calls functionReference  when all promises are fulfilled. They become parameters for callback call.

### swait(<list of variables>)

    functionReference.swait(...)

>   same with wait but has an additional call to preserve swarm phase environments. This functions should be used only with SwarmUtil, SwarmESB or SwarmCore derived projects.


### async(<list of variables>)

    functionReference.async(...)

> Make an asynchronous call when possible , returns a promise that get fulfilled when all the arguments are fulfilled.



### nasync(<list of variables>)

> similar with async but ignores errors, fulfills the promise with a null value...
> the programmer should test for null values (errors are normal part of the logic in many cases (missing a key in cache, etc))


### error handling

   wait, swait primitives can take a function as the last argument. On errors happening in any asynchronous call, that function will be called once.
   The fail approach documented bellow is now marked obsolete as it is usually much easier to just pass a callback (eventually chain an inherited one) than to create a fail block

#OBSOLETE functions, do not use, il will be removed in the next versions

### fail(<list of variables>)

    functionReference.fail(...)

> call the functionReference when a promise given as argument has failed. The callback will be called with an Error.

### timeout(timeout, <list of variables>)

    functionReference.timeout(...)

> like fail, but also get called if any promise given as arguments is unfulfilled until timeout expires. The callback will be called with an Error.
> Do not use both fail and and timeout, they will be both called!

