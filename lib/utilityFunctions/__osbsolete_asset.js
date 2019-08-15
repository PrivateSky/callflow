exports.createForObject = function(valueObject, thisObject, localId){
	var ret = require("./base").createForObject(valueObject, thisObject, localId);

	ret.swarm           = null;
	ret.onReturn        = null;
	ret.onResult        = null;
	ret.asyncReturn     = null;
	ret.return          = null;
	ret.home            = null;
	ret.isPersisted  	= function () {
		return thisObject.getMetadata('persisted') === true;
	};

	return ret;
};