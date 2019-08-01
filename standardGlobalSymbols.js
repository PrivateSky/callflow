let logger = console;

if (process.env.NO_LOGS !== 'true') {
    try {
        const PSKLoggerModule = require('psklogger');
        const PSKLogger = PSKLoggerModule.PSKLogger;
        
        logger = PSKLogger.getLogger();
        
        // TODO: remove this once $$ logger is used instead of console
        PSKLoggerModule.overwriteConsole();

        console.log('Logger init successful', process.pid);
    } catch (e) {
        console.warn('Logger not available, using console', e);
        logger = console;
    }
} else {
    console.log('Environment flag NO_LOGS is set, logging to console');
}

$$.registerGlobalSymbol = function (newSymbol, value) {
    if (typeof $$[newSymbol] == "undefined") {
        Object.defineProperty($$, newSymbol, {
            value: value,
            writable: false
        });
    } else {
        logger.error("Refusing to overwrite $$." + newSymbol);
    }
};

$$.registerGlobalSymbol("autoThrow", function (err) {
    if (!err) {
        throw err;
    }
});

$$.registerGlobalSymbol("ignoreError", function (err) {
    if (err) {
        $$.error(err);
    }
});

$$.registerGlobalSymbol("exception", function (message, type) {
        throw new Error(message);
});

$$.registerGlobalSymbol("throw", function (message, type) {
        throw new Error(message);
});

/* a feature is planned but not implemented (during development) but
also it could remain in production and should be flagged asap*/
$$.registerGlobalSymbol("incomplete", function (...args) {
    args.unshift("Incomplete feature touched:");
    logger.warn(...args);
});

/* used during development and when trying to discover elusive errors*/
$$.registerGlobalSymbol("assert", function (value, explainWhy) {
    if (!value) {
        throw new Error("Assert false " + explainWhy);
    }
});

/* enable/disabale flags that control psk behaviour*/
$$.registerGlobalSymbol("flags", function (flagName, value) {
    $$.incomplete("flags handling not implemented");
});

$$.registerGlobalSymbol("obsolete", function (...args) {
    args.unshift("Obsolete feature:");
    logger.log(...args);
});

$$.registerGlobalSymbol("log", function (...args) {
    args.unshift("Log:");
    logger.log(...args);
});

$$.registerGlobalSymbol("info", function (...args) {
    args.unshift("Info:");
    logger.log(...args);
});


$$.registerGlobalSymbol("err", function (...args) {
    args.unshift("Error:");
    logger.error(...args);
});

$$.registerGlobalSymbol("warn", function (...args) {
    args.unshift("Warn:");
    logger.warn(...args);
});

$$.registerGlobalSymbol("syntaxError", function (...args) {
    args.unshift("syntaxError:");
    logger.log(...args);
});

/* log unknown exceptions*/
$$.registerGlobalSymbol("unknownException", function (...args) {
    args.unshift("unknownException:");
    logger.log(...args);
});

/* PrivateSky event, used by monitoring and statistics*/
$$.registerGlobalSymbol("event", function (event, ...args) {
    if (logger.hasOwnProperty('event')) {
        logger.event(event, ...args);
    } else {
        console.log(event, ...args);
    }
});

/* */
$$.registerGlobalSymbol("redirectLog", function(logType, logObject) {
    logger.redirect(logType, logObject);
});

/* log throttling event // it is just an event?*/
$$.registerGlobalSymbol("throttlingEvent", function (...args) {
    logger.log(...args);
});
