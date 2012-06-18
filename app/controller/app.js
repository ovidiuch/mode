exports.super = 'controller/base';

exports.class = function(mode)
{
	this.action.init = function(callback)
	{
		this.args.layout = 'default';
		
		this.args.title = 'Hello World!';

		callback();
	}
};