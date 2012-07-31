var mode = require('../mode.js');

mode.class.Base = mode.class.Base.extend(function(parent)
{
	this.bind = this.static.bind = function(callback)
	{
		this.bound = true;

		if(this.domain)
		{
			callback = this.domain.bind(callback);
		}
		var that = this;
		
		return function()
		{
			callback.apply(that, arguments);
		};
	};
	this.call = this.static.call = function(method)
	{
		if(typeof(this[method]) != 'function')
		{
			return;
		}
		var args = Array.prototype.slice.call(arguments, 1);

		return this[method].apply(this, args);
	}
},
true);

module.exports = mode.class.Base;