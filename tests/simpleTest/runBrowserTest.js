require("../../index.js");
const fs = require('fs');
const { exec } = require('child_process');
const port = 9876;
var requiredDependencies = {
    "soundpubsub":{
        "id":"/modules/soundpubsub",
        "git_repo":"https://github.com/PrivateSky/soundpubsub.git"
    }
}

var myFlow = $$.callflow.describe("flowTest",{

    start:function(end){
        this.end = end;
        this.requiredModulesOptions = "";
        var join = this.parallel(this.joinGitClone);
        for(var dependencyKey in requiredDependencies){

            var dependency = {};
            this.requiredModulesOptions += " -r ./"+dependencyKey+":"+requiredDependencies[dependencyKey].id;
            dependency [dependencyKey] = requiredDependencies[dependencyKey];
            join.checkDirectory(dependency, join.async);
        }
    },

    checkDirectory:function(dependency, callback){
        var dependencyPath = Object.keys(dependency)[0];
        try{
            fs.lstatSync(dependencyPath).isDirectory()
            callback();
        }catch(e){
            // Handle error
            if(e.code == 'ENOENT'){
                this.gitClone(dependency[dependencyPath].git_repo, callback);
            }else {
                console.error(e);
            }
        }
    },

    gitClone:function(git_repo, callback){
        exec('git clone '+git_repo, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            callback();
        });
    },

    async:function(){
    },

    joinGitClone:function(err){
        if(err){
            console.error(err);
            return;
        }
        this.browserify();
    },

    browserify:function(){
        exec('browserify simpleTest.js'+this.requiredModulesOptions+'>simpleTestBundle.js', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            this.removeDependencies();
            this.openHttpServer();

        });
    },
    openHttpServer:function(){
        exec("http-server -p "+ port, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        this.end();
    },

    removeDependencies:function(){
        for(var dependencyKey in requiredDependencies){
            if(dependencyKey){
                this.deleteFolderRecursive(dependencyKey);
            }
        }
    },
    deleteFolderRecursive: function(path){
        var self = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index){
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    self.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
});

myflow.describe(function(){
    console.log("Open your browser at http://localhost:"+ port+"/simpleTest.html and check the console");
});