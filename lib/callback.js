var mode = require('./mode.js');

exports.create = function(callback)
{
	var fn = function(){};

	var prototype = new Callback();

	for(var i in prototype)
	{
		fn[i] = prototype[i];
	}
	fn.callback = callback;

	return fn;
};
var Callback = function(){};

Callback.prototype =
{
	bind: function(callback)
	{
		this.bound = true;

		return function()
		{
			callback.apply(this, arguments);
		};
	},
	respond: function()
	{
		this.done = true;

		this.callback.apply(this, arguments);
	}
};