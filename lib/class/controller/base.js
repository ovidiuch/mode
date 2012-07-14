var mode = require('../../mode.js');

(mode.controller = {}).Base = mode.class.Base.extend(function(parent)
{
	this.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: message
		});
	};
	this.redirect = function(query, args)
	{
		query = mode.mustache.compile(query, this.args);

		mode.path.redirect(query, args, this.conn);
	};
},
true);

module.exports = mode.controller.Base;