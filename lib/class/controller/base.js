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
},
true);

module.exports = mode.controller.Base;