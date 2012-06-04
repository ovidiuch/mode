exports.init = function()
{
	console.log('Starting mode.js...');

	var path = require('fs').realpathSync(__dirname + '/../');

	this.file = require('./file.js');

	var modules = this.file.readdir(path + '/lib');
	var configs = this.file.readdir(path + '/conf');

	for(var i in modules)
	{
		console.log('Loading module: ' + modules[i]);

		this[this.key(modules[i])] = require(path + '/lib' + modules[i]);
	}
	for(var i in configs)
	{
		console.log('Loading config: ' + configs[i]);

		this[this.key(configs[i])] = require(path + '/conf' + configs[i]);
	}
	this.settings.path =
	{
		base: path
	};
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
			self.settings.server, function(request, response)
			{
				self.request(request, response);
			}
		);
	});
};
this.key = function(path)
{
	return path.replace(/^.*\/(.+?)\.js$/, '$1');
};
this.request = function(request, response)
{
	var url = require('url').parse(request.url, true);

	this.load(url.pathname, response);
};
this.load = function(query, response)
{
	this.path.load(query, {}, response);
};