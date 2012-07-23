var mode = require('../../mode.js');

(mode.controller = {}).Base = mode.class.Base.extend(function(parent)
{
	this.bind = function(callback)
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
	this.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: message
		});
	};
	this.redirect = function(query, args)
	{
		query = mode.mustache.parse(query, this.args);

		mode.path.redirect(query, args, this.conn);
	};
},
true);

module.exports = mode.controller.Base;