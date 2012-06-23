exports.setup = function(path)
{
	init(this);

	if(!path || !path.base)
	{
		(path = path || {}).base = process.cwd();
	}
	console.log('Loading app: ' + path.base);

	var dirs = ['app', 'conf', 'lib'];

	for(var i in dirs)
	{
		path[dirs[i]] = path[dirs[i]] || path.base + '/' + dirs[i];
	}
	this.settings = { path: path };

	this.file.index(path.conf, false, function(name, module)
	{
		console.log('Loading config: ' + name);
	});
	var types = path.class || ['model', 'controller'];

	for(var i in types)
	{
		this[types[i]] = this[types[i]] || {};

		this.class.index(path.app + '/' + types[i], types[i]);
	}
	this.view.index(path.app + '/view');
};
exports.start = function(settings, callback)
{
	if(!this.server)
	{
		this.setup();
	}
	var mode = this;

	this.server.start(settings, function(conn)
	{
		request(mode, conn, callback);
	});
};
var init = function(mode)
{
	console.log('Initialising mode...');

	require('./file.js').index(__dirname, false, function(name, module)
	{
		if(module == mode)
		{
			return;
		}
		console.log('Loading module: ' + name);

		mode[name] = module;
	});
	mode.class.index(__dirname + '/class');

	process.on('uncaughtException', function(error)
	{
		mode.error.handle(error);
	});
};
var request = function(mode, conn, callback)
{
	var path = require('url').parse(conn.request.url, true).pathname;

	console.log('Loading path: ' + path);

	if(callback)
	{
		callback(conn, path);
	}
	else if(mode.path)
	{
		mode.path.load(path, {}, conn);
	}
};