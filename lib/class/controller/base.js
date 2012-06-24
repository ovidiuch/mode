var mode = require('../../mode.js');

mode.controller = {};

(mode.controller.Base = mode.class.Base.extend(function(parent)
{
	this.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: message
		},
		this.conn);
	};
}))
.abstract = true;