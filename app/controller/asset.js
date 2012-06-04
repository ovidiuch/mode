var mode = require('../../lib/mode.js');

exports.controller = function(){};

exports.controller.prototype =
{
	load: function(callback)
	{
		var path = mode.settings.path.app + '/asset' + this.args.path;

		var that = this;

		require('fs').readFile(path, function(error, data)
		{
			if(error)
			{
				mode.error.throw(
				{
					code: 404,
					name: 'Not found',
					keyword: that.args.path
				},
				that.response);
			}
			callback(data);
		});
	}
};