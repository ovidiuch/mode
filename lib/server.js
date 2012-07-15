var mode = require('./mode.js');

exports.start = function(args, callback)
{
	console.log('Starting HTTP server...');

	var that = this;

	require('http').createServer(function(req, res)
	{
		req.headers.protocol = 'http:';

		that.connection(new Connection(req, res, callback));
	})
	.listen(args.port || 1337, args.host, function()
	{ 
		console.log('HTTP server ON.');
	});
};
exports.index = function(conn)
{
	return connections.indexOf(conn);
};
exports.remove = function(conn)
{
	var index = this.index(conn);

	console.log('Closing connection #' + index);

	if(index != -1)
	{
		connections.splice(index, 1);
	}
};
var connections = [];

this.connection = function(object)
{
	var length = connections.push(object);

	console.log('New connection... (' + length + ')');

	return object;
};
var server = this;

var Connection = function(req, res, callback)
{
	this.req = req;
	this.res = res;

	this.init(callback);
};
Connection.prototype =
{
	init: function(callback)
	{
		var that = this;

		this.res.on('close', function()
		{
			that.close();
		});
		mode.cookie.init(this.req, this.res);

		that.data = {};

		if(this.req.method != 'POST')
		{
			callback(this);
		}
		else this.read(callback);
	},
	read: function(callback)
	{
		var that = this, body = '';

		this.req.on('data', function(data)
		{
			if((body += data).length > 1e6)
			{
				that.req.connection.destroy();
			}
		});
		this.req.on('end', function()
		{
			that.data = mode.path.args
			(
				require('querystring').parse(body)
			);
			callback(that);
		});
	},
	close: function(data, code, headers)
	{
		server.remove(this);
		
		this.res.writeHead(code || 200, headers);

		this.res.end(data);
	},
	redirect: function(url)
	{
		this.close('', 302, { Location: url });
	}
};