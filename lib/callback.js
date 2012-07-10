var mode = require('./mode.js');

exports.create = function(fn, scope)
{
	return new Callback(fn, scope);
};
var Callback = function(fn, scope)
{
	this.fn = fn;
	
	this.scope = scope;
};
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