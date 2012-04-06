exports.throw = function(params)
{
	throw new Error(JSON.stringify(params));
};
exports.handle = function(error)
{
	console.log(JSON.parse(error.message));
};