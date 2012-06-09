exports.class = function(mode)
{
	this.super = 'controller/base';
	
	this.index = function(callback)
	{
		callback('Hmm...');
	};
};