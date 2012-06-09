exports.super = 'controller/base';

exports.class = function(mode)
{
	this.action.load = function(callback)
	{
		callback('ERROR: ' + this.args.message);
	};
};