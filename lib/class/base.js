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
	this.error = this.static.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: message
		});
	};
},
true);

module.exports = mode.class.Base;