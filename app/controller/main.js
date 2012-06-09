exports.super = 'controller/base';

exports.class = function(mode)
{
	this.static.counter = 0;

	this.action.index = function(callback)
	{
		this.args.counter = ++this.static.counter;

		callback();
	};
};