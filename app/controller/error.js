exports.class = function(mode)
{
	this.super = 'controller/base';
	
	this.load = function(callback)
	{
		callback('ERROR: ' + this.args.message);
	};
};