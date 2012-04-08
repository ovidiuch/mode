exports.throw = function(params)
{
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
			code: 500,
			name: error.message
		};
	}
	console.log('Exception', object);
};