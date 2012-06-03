var mode = require('./mode.js');

exports.load = function(query, response)
{
	this.process(query).load(response);
};
exports.process = function(query)
{
	return new Page(query);
};

var Page = function(query)
{
	this.init(query);
};
Page.prototype.init = function(query)
{
	this.query = query;

	if(!this.identify(mode.routes.list))
	{
		this.error =
		{
			code: 500,
			name: 'invalid_path',
			args: { query: this.query }
		};
		return;
	}
	this.args = this.args();
	
	if(!(this.controller = mode.controller.exists(this.args.controller)))
	{
		this.error =
		{
			code: 500,
			name: 'invalid_controller',
			args: { controller: this.args.controller }
		};
		return;
	}
	if(typeof(this.controller.prototype[this.args.action]) != 'function')
	{
		this.error =
		{
			code: 500,
			name: 'invalid_action',
			args: { action: this.args.action }
		};
	}
};
Page.prototype.identify = function(routes)
{
	for(var i in routes)
	{
		if(this.vars = this.query.match(routes[i].pattern))
		{	
			return (this.route = routes[i]);
		}
	}
};
Page.prototype.args = function()
{
	var that = this, args = {};

	for(var i in this.route.args)
	{
		args[i] = this.route.args[i].replace(/\$([0-9]+)/, function()
		{
			return that.vars[arguments[1]];
		});
	}
	return args;
};
Page.prototype.load = function(response)
{
	console.log('Loading query: ' + this.query);

	if(this.error)
	{
		response.end();

		mode.error.throw(this.error);
	}
	var controller = new this.controller();

	controller[this.args.action]();

	// Pour controller args into view
	
	response.writeHead(200,
	{
		'Content-Type': 'text/html'
	});
	response.end();
};