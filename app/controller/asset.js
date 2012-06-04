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
					message: 'Not found ' + that.args.path
				},
				that.conn);
			}
			callback(data);
		});
	}
};