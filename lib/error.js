var mode = require('./mode.js');

exports.throw = function(params, response)
{
	this.response = response;

	throw new Error(JSON.stringify(params));
};
exports.handle = function(error)
{
	object = this.object(error);

	console.log('Exception:', object.message);

	if(this.response)
	{
		try
		{
			mode.path.load('/error/load', object, this.response);
		}
		catch(e)
		{
			console.log('Circular exception:', e);

			this.response.end('error');
		}
		this.response = null;
	}
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
this.response = null;