exports.super = 'controller/base';

exports.class = function(mode)
{
	this.load = function(callback)
	{
		callback('ERROR: ' + this.args.message);
	};
};