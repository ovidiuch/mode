exports.super = 'controller/base';

exports.class = function(mode)
{
	this.static.counter = 0;

	this.action.index = function(callback)
	{
		this.static.counter++;

		callback('Hello... ' + this.static.counter);
	};
};