exports.super = 'base';

exports.abstract = true;

exports.class = function(mode)
{
	this.action = {};

	this.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: message
		},
		this.conn);
	};
};