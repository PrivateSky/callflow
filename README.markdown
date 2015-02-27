Very small library that add the wait, async pattern to promises in Java Script (currently we are using Q library).
It is syntactic sugar on promises APIs to clean the code but it is also very important for swarm project (especially for SwarmCore)
to help implementing proper multi-tenant, multi-user server side middleware. Asynchron is transparently keep track of the swarm
context when executing asynchronous code (usage of swait). Asynchron can be also used outside of swarm projects.

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

   wait, swait primitives can take a function as the last argument. On errors fulfilling the asynchronous calls, that function will be called.
   The fail approach documented bellow is now marked obsolete as it is usually much easier to just pass a callback (eventually chain an inherited one) than to create a fail block

#OBSOLETE functions, do not use, il will be removed in the next versions

### fail(<list of variables>)

    functionReference.fail(...)

> call the functionReference when a promise given as argument has failed. The callback will be called with an Error.

### timeout(timeout, <list of variables>)

    functionReference.timeout(...)

> like fail, but also get called if any promise given as arguments is unfulfilled until timeout expires. The callback will be called with an Error.
> Do not use both fail and and timeout, they will be both called!

