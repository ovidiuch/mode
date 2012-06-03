var mode = require('./mode.js');

exports.throw = function(params, response)
{
	this.response = response;

	throw new Error(JSON.stringify(params));
};
exports.handle = function(error)
{
	try
	{
		var object = JSON.parse(error.message);
	}
	catch(e)
	{
		object =
		{
			code: 500, name: error.message
		};
	}
	console.log('Exception: ', object);
	
	if(this.response)
	{
		try
		{
			mode.path.load('/error/load', this.response);
		}
		catch(e)
		{
			console.log('Circular exception: ', e);

			this.response.end('error');
		}
	}
};