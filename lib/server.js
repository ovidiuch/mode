exports.start = function(options)
{
	console.log('Initializing http server...');

	require('http').createServer(function(req, res)
	{
		options.callback(req, res);
	})
	.listen(options.port, options.hostname, function()
	{
		console.log('HTTP Server ON.');
	});
};