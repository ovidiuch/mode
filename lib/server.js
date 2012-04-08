exports.start = function(options, callback)
{
	console.log('Initializing HTTP server...');

	require('http').createServer(function(request, response)
	{
		callback(request, response);
	})
	.listen(options.port, options.hostname, function()
	{
		console.log('HTTP server ON.');
	});
};