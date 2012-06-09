exports.class = function(mode)
{
	this.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: message
		},
		this.conn);
	};
};