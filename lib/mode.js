exports.init = function()
{
	console.log('Starting mode.js...');

	var path = 
	{
		base: require('fs').realpathSync(__dirname + '/../')
	};
	path.app = path.base + '/app';
	path.conf = path.base + '/conf';
	path.lib = path.base + '/lib';

	this.file = require('./file.js');

	var modules = this.file.readdir(path.lib);
	var configs = this.file.readdir(path.conf);

	for(var i in modules)
	{
		console.log('Loading module: ' + modules[i]);

		this[this.key(modules[i])] = require(path.lib + modules[i]);
	}
	for(var i in configs)
	{
		console.log('Loading config: ' + configs[i]);

		this[this.key(configs[i])] = require(path.conf + configs[i]);
	}
	this.settings.path = path;

	var self = this;

	process.on('uncaughtException', function(error)
	{
		self.error.handle(error);
	});
	require('./index.js').init(
	[
		this.controller = require('./controller.js')
	],
	function()
	{
		require('./server.js').start
		(
			self.settings.server, function(conn)
			{
				self.request(conn);
			}
		);
	});
};
this.key = function(path)
{
	return path.replace(/^.*\/(.+?)\.js$/, '$1');
};
this.request = function(conn)
{
	var url = require('url').parse(conn.request.url, true);

	this.path.load(url.pathname, {}, conn);
};