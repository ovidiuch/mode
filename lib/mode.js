exports.init = function()
{
	this.file = require('./file.js');

	this.error = require('./error.js');
	//this.path = require('./path.js');

	this.settings = require('../conf/settings.js');

	this.settings.path =
	{
		base: require('fs').realpathSync(__dirname + '/../')
	};
	var self = this;

	process.on('uncaughtException', function(error)
	{
		self.error.handle(error);
	});
	require('./index.js').init(
	[
		require('./controller.js')
	],
	function()
	{
		require('./server.js').start
		(
			self.settings.server, function(request, response)
			{
				//self.request(request, response);
			}
		);
	});
};
/*exports.load = function(query, response)
{
	path.process(query).load(response);
};*/

/*this.request = function(request, response)
{
	var url = require('url').parse(request.url, true);

	this.load(url.pathname, response);
};*/