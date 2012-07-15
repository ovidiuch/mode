var mode = require('./mode.js');

exports.start = function(args, callback)
{
	console.log('Starting HTTP server...');

	var that = this;

	require('http').createServer(function(req, res)
	{
		console.log('New connection... (' + connections.length + ')');

		req.headers.protocol = 'http:';

		connections.push(new Connection(req, res, callback));
	})
	.listen(args.port || 1337, args.host, function()
	{ 
		console.log('HTTP server ON.');
	});
};
var remove = function(conn)
{
	var index = connections.indexOf(conn);

	console.log('Closing connection #' + index);

	if(index != -1)
	{
		connections.splice(index, 1);
	}
};
var connections = [];

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
		that.data = {};

		if(this.req.method == 'POST')
		{
			this.read(callback);
		}
		else process.nextTick(function()
		{
			callback(that);
		});
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
		remove(this);
		
		this.res.writeHead(code || 200, headers);

		this.res.end(data);
	},
	redirect: function(url)
	{
		this.close('', 302, { Location: url });
	}
};