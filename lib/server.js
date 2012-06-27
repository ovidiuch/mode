exports.start = function(args, callback)
{
	console.log('Starting HTTP server...');

	var that = this;

	require('http').createServer(function(request, response)
	{
		callback(that.connection(
		{
			request: request, response: response
		}));
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
exports.close = function(conn, data)
{
	var index = this.index(conn);

	console.log('Closing connection #' + index);

	if(index != -1)
	{
		connections.splice(index, 1);
	}
	conn.response.end(data);
};
var connections = [];

this.connection = function(object)
{
	var that = this;

	object.response.on('close', function()
	{
		that.close(object);
	});
	var length = connections.push(object);

	console.log('New connection... (' + length + ')');

	return object;
};