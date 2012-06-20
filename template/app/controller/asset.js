exports.super = 'controller/base';

exports.class = function(mode)
{
	this.action.load = function(callback)
	{
		var path = mode.settings.path.app + '/asset' + this.args.path;

		var that = this;

		require('fs').readFile(path, function(error, data)
		{
			if(error)
			{
				that.error(404, 'Not found ' + that.args.path);
			}
			callback(data);
		});
	};
};