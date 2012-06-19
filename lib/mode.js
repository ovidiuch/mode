exports.init = function()
{
	console.log('Starting mode.js...');

	var path = 
	{
		base: require('fs').realpathSync(__dirname + '/../')
	};
	var dirs = ['app', 'conf', 'lib'];

	for(var i in dirs)
	{
		path[dirs[i]] = path.base + '/' + dirs[i];
	}
	this.file = require('./file.js');

	var that = this;

	this.file.index(path.lib, false, function(name, module)
	{
		if(module != that)
		{
			that.load(name, module, 'module');
		}
	});
	this.file.index(path.conf, false, function(name, module)
	{
		that.load(name, module, 'config');
	});
	this.settings.path = path;

	this.class.index(path.lib + '/class');

	var types = ['model', 'controller'];

	for(var i in types)
	{
		this.class.index(path.app + '/' + types[i], types[i]);
	}
	this.view.index(path.app + '/view');

	this.class.build();

	var that = this;

	process.on('uncaughtException', function(error)
	{
		that.error.handle(error);
	});
	this.server.start(this.settings.server, function(conn)
	{
		that.request(conn);
	});
};
this.load = function(name, module, type)
{
	console.log('Loading ' + type + ': ' + name);

	this[name] = module;
};
this.request = function(conn)
{
	var url = require('url').parse(conn.request.url, true);

	this.path.load(url.pathname, {}, conn);
};