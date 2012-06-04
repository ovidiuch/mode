var mode = require('../../lib/mode.js');

exports.controller = function(){};

exports.controller.prototype =
{
	load: function(callback)
	{
		callback('ERROR. ' + this.args.name + ': ' + this.args.keyword);
	}
};