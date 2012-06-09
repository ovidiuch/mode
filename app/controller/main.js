exports.super = 'controller/base';

exports.class = function(mode)
{
	this.index = function(callback)
	{
		callback('Hmm...');
	};
};