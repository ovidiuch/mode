exports.super = 'controller/app';

exports.class = function(mode, parent)
{
	this.static.counter = 0;

	this.action.init = function(callback)
	{
		parent.action.init.call(this);

		this.args.title = 'Hello #' + ++this.static.counter;

		callback();
	};
	this.action.index = function(callback)
	{
		this.args.counter = this.static.counter;

		callback();
	};
};