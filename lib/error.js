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
	error = this.object(error);

	console.log('Exception:', error);

	mode.server.each(error.conn, function(conn)
	{
		try
		{
			mode.path.load('/error/load', error, conn);
		}
		catch(e)
		{
			console.log('Circular exception:', e);

			mode.server.close(conn, 'error');
		}
	});
};
this.object = function(error)
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