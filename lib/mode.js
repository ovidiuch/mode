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

	this.index(path.lib);
	this.index(path.conf);

	this.settings.path = path;

	this.class.index(path.lib + '/class');

	this.view.index();
	this.controller.index();

	this.class.build();

	var self = this;

	process.on('uncaughtException', function(error)
	{
		self.error.handle(error);
	});
	this.server.start(this.settings.server, function(conn)
	{
		self.request(conn);
	});
};
this.index = function(path)
{
	var files = this.file.readdir(path), name;

	for(var i in files)
	{
		name = this.file.name(files[i]);

		this.load(require(path + files[i]), name);
	}
};
this.load = function(module, name)
{
	if(module == this)
	{
		return;
	}
	console.log('Loading module: ' + name);

	this[name] = module;
};
this.request = function(conn)
{
	var url = require('url').parse(conn.request.url, true);

	this.path.load(url.pathname, {}, conn);
};