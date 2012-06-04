var mode = require('../../lib/mode.js');

exports.controller = function(){};

exports.controller.prototype =
{
	index: function(callback)
	{
		callback('Hmm...');
	}
}