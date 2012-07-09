exports.setup = function(path)
{
	this.init();

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

	this.index(path);
};
exports.start = function(settings, callback)
{
	if(!this.server)
	{
		this.init();
	}
	var that = this;

	if(this.settings.db && !this.settings.db.adaptor.conn)
	{
		this.model.init(this.settings.db, function()
		{
			that.start(settings, callback);
		});
		return;
	}
	that.server.start(settings.server, function(conn)
	{
		that.request(conn, callback);
	});
};
this.init = function()
{
	console.log('Initialising mode...');

	var that = this;

	require('./file.js').index(__dirname, false, function(name, module)
	{
		if(module == that)
		{
			return;
		}
		console.log('Loading module: ' + name);

		that[name] = module;
	});
	this.class.index(__dirname + '/class');

	this.helper = {};
};
this.index = function(path)
{
	var types = path.types || ['model', 'controller'];
	
	for(var i in types)
	{
		this.class.index(path.app, types[i]);
	}
	this.file.index(path.app + '/helper', true, function(name, module)
	{
		console.log('Loading helper: ' + name);
	});
	this.view.index(path.app + '/view');

	this.file.index(path.conf, false, function(name, module)
	{
		console.log('Loading config: ' + name);
	});
};
this.request = function(conn, callback)
{
	var path = require('url').parse(conn.request.url, true).pathname;

	console.log('Loading path: ' + path);

	var that = this;

	if(callback)
	{
		callback(conn, path);
	}
	else if(this.path)
	{
		var domain = conn.domain = require('domain').create();

		domain.on('error', function(error)
		{
			that.error.handle(error, conn);
		});
		domain.run(function()
		{
			that.path.load(path, {}, conn);
		});
	}
};