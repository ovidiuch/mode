exports.super = 'controller/base';

exports.abstract = true;

exports.class = function(mode)
{
	this.action.init = function(callback)
	{
		this.args.layout = 'default';

		this.args.title = 'Hello World!';

		if(typeof(callback) == 'function')
		{
			callback();
		}
	}
};