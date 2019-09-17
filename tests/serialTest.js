require('../../../psknode/bundles/pskruntime');
const assert = require("double-check").assert;


const flow = $$.flow.describe('serialTest', {
    init: function (callback) {
        this.times = [];
        this.incrementor = incrementor();

        const serial = this.serial(() => {
            this.times.push(this.incrementor.next().value);
        });

        serial.__asyncTask(1000, serial.__progress);
        serial.__asyncTask(1000, serial.__progress);
        serial.__asyncTask(1, serial.__progress);

        setTimeout(() => {
            assert.equal(this.times.length, 4, 'not all functions executed yet');
            this.__verifyResults();
            callback();
        }, 4000);
    },
    __progress: function (err, res) {
        this.times.push(res.value);
    },
    __asyncTask: function (timeout, callback) {
        let index = this.incrementor.next();
        setTimeout(() => callback(undefined, index), timeout);
    },
    __verifyResults: function () {
        console.log('times ', this.times);
        for(let i = 0; i < this.times.length - 1; ++i) {
            assert.true(this.times[i] <= this.times[i + 1], 'serial callback executed before __progress');
        }
    }
})();


assert.callback('serialTest', function(callback) {
    try{
        flow.init(callback);
    }catch(err){
        //clean
        throw err;
    }

}, 5000);


function* incrementor() {
    let i = 0;
    while(i < Infinity) {
        yield i++;
    }
}


