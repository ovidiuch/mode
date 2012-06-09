exports.super = 'controller/base';

exports.class = function(mode)
{
	this.action.index = function(callback)
	{
		callback('Hmm...');
	};
};