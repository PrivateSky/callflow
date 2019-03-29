
// related to: SwarmSpace.SwarmDescription.createPhase()

function InterceptorRegistry() {
    var rules = {};

    // ??? $$.errorHandler Library ???
    var _CLASS_NAME = 'InterceptorRegistry';

    function _throwError(err, msg) {
        console.log(err.message, `${_CLASS_NAME} error message:`, msg);
        throw err;
    }
    function _warning(msg) {
        console.log(`${_CLASS_NAME} warning message:`, msg);
    }


    var getWhenOptions = (function () {
        var WHEN_OPTIONS;
        return function () {
            if (WHEN_OPTIONS === undefined) {
                WHEN_OPTIONS = [
                    $$.CONSTANTS.BEFORE_INTERCEPTOR,
                    $$.CONSTANTS.AFTER_INTERCEPTOR
                ];
            }
            return WHEN_OPTIONS;
        };
    })();

    function verifyWhenOption(when) {
        if (!getWhenOptions().includes(when)) {
            _throwError(new RangeError(`Option '${when}' is wrong!`),
                `it should be one of: ${getWhenOptions()}`);
        }
    }
    function verifyIsFunctionType(fn) {
        if (typeof fn !== 'function') {
            _throwError(new TypeError(`Parameter '${fn}' is wrong!`),
                `it should be a function, not ${typeof fn}!`);
        }
    }
    function resolveNamespaceResolution(swarmTypeName) {
        return (swarmTypeName.includes(".") ? swarmTypeName : ($$.libraryPrefix + "." + swarmTypeName));
    }
    function registerInterceptor(key, fn) {
        if (rules.hasOwnProperty(key)) {
            if (rules[key].has(fn)) {
                _warning(`Duplicated interceptor for '${key}'`);
            }
            rules[key].add(fn);
        }
        else {
            rules[key] = new Set([fn]);
        }
    }


    this.register = function (swarmTypeName, phaseName, when, fn) {
        verifyWhenOption(when);
        verifyIsFunctionType(fn);

        var resolvedSwarmTypeName = resolveNamespaceResolution(swarmTypeName);
        var key = `${resolvedSwarmTypeName}/${phaseName}/${when}`;
        registerInterceptor(key, fn);
    }

    // this.unregister = function () { }

    this.callInterceptors = function (key, targetObject, args) {
        if (rules.hasOwnProperty(key)) {
            // First registered -> First called
            for (let fn of rules[key]) {
                fn.apply(targetObject, args);
            }
        }
    }
}


exports.createInterceptorRegistry = function () {
    return new InterceptorRegistry();
};
