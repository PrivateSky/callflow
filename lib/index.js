
if(typeof singleton_callflow_module_workaround_for_wired_node_js_caching == 'undefined') {
    singleton_callflow_module_workaround_for_wired_node_js_caching  = module;
} else {
    module.exports = singleton_callflow_module_workaround_for_wired_node_js_caching .exports;
    return;
}

if(global.__global__enable_OBSOLETE_ASYNC_WAIT){
    require("./async_wait.js");
}


exports.createFlow = require("./flow.js").create;
exports.create = exports.createFlow;

exports.bindAllMembers = function(object){
    for(var property in object){
        if(typeof object[property] == 'function'){
            object[property] = object[property].bind(object);
        }
    }
    return object;
}