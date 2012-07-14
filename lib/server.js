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

	this.callback = callback;

	this.init();
};
Connection.prototype =
{
	init: function()
	{
		var that = this;

		this.res.on('close', function()
		{
			that.close();
		});
		that.data = {};

		if(this.req.method != 'POST')
		{
			this.callback(this);

			return;
		}
		var body = '';

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
			that.callback(that);
		});
	},
	close: function(data)
	{
		server.remove(this);

		this.res.end(data);
	},
	redirect: function(url)
	{
		this.res.writeHead(302, { 'Location': url });
		
		this.close('');
	}
};