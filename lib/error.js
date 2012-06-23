var mode = require('./mode.js');

exports.throw = function(params, conn)
{
	if(conn)
	{
		params.conn = mode.server.index(conn);
	}
	throw new Error(JSON.stringify(params));
};
exports.handle = function(error)
{
	error = object(error);

	console.log('Exception:', error);

	mode.server.each(error.conn, function(conn)
	{
		try
		{
			mode.path.load('/error/show', error, conn);
		}
		catch(error)
		{
			error = object(error);

			console.log('Circular exception:', error);

			conn.response.writeHead(error.code || 500);

			mode.server.close(conn, 'Error');
		}
	});
};
var object = function(error)
{
	try
	{
		var object = JSON.parse(error.message);
	}
	catch(e)
	{
		object =
		{
			code: 500, message: error.message
		};
	}
	return object;
};