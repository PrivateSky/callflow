
var asynchron = require("../lib/asynchron.js");


function loadPenguin(nickName, callBack){
    //callBack(undefined, nickName);
    if(nickName == "M"){
        callBack(new Error("No penguin available " + nickName));
    } else {
        callBack(null,nickName);
    }

}

function loadPenguinFamily(father, mother, callBack){
    callBack(undefined, 'In harvest.family we got those cute penguin children objects' + " " + father + " " + mother);
}

/*
 call nasync in place of async and errors are automatically handled by returning null
 Sometimes you want this behaviour (for example when reading from a cache and you expect missing keys)
 */
var mother = loadPenguin.nasync('F');
var father = loadPenguin.nasync("M");


var family = loadPenguinFamily.async(mother, father);

(function (family){
    console.log(family);
}).wait(family, function(err){
        console.log("Failed test, wrong call!", err);
    });

