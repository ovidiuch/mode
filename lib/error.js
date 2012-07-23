var mode = require('./mode.js');

mode.throw = exports.throw = function(code, message, extra)
{
	args = { code: code, message: message };

	for(var i in extra) 
	{
		args[i] = extra[i];
	}
	throw new Error(JSON.stringify(args));
};
exports.handle = function(error, conn)
{
	error = object(error);

	console.log('Exception:', error);
	
	try
	{
		mode.path.load('/error/show', error, conn);
	}
	catch(error)
	{
		error = object(error);

		console.log('Circular exception:', error);

		conn.res.writeHead(error.code || 500);

		conn.close('Error');
	}
};
var object = function(error)
{
	try
	{
		var object = JSON.parse(error.message);
	}
	catch(e)
	{
		object = { code: 500, message: error.message };
	}
	return object;
};