exports.init = function()
{
	global.settings = require('../conf/settings.js');
	global.error = require('./error.js');
	global.path = require('./path.js');

	var self = this;

	settings.path.base = require('fs').realpathSync(__dirname + '/../');

	process.on('uncaughtException', function(e)
	{
		error.handle(e);
	});
	require('./index.js').init(
	[
		require('./controller.js')
	],
	function()
	{
		require('./server.js').start(
		{
			hostname: settings.server.hostname,
			port: settings.server.port,

			callback: function(req, res)
			{
				self.request(req, res);
			}
		});
	});
};
exports.load = function(query, res)
{
	path.process(query).load(res);
};

this.request = function(req, res)
{
	var url = require('url').parse(req.url, true);

	this.load(url.pathname, res);
};