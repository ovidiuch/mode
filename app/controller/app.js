exports.super = 'controller/base';

exports.abstract = true;

exports.class = function(mode)
{
	this.action.init = function(callback)
	{
		this.args.layout = 'default';

		if(typeof(callback) == 'function')
		{
			callback();
		}
	}
};