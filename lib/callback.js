var mode = require('./mode.js');

exports.create = function(fn, scope)
{
	var callback = new Callback();

	callback.fn = fn;
	callback.scope = scope;

	return callback;
};
var Callback = function(){};

Callback.prototype =
{
	bind: function(fn)
	{
		this.bound = true;

		if(this.domain)
		{
			fn = this.domain.bind(fn);
		}
		var scope = this.scope || this;
		
		return function()
		{
			fn.apply(scope, arguments);
		};
	},
	respond: function()
	{
		this.done = true;

		this.fn.apply(this, arguments);
	}
};