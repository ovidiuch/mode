var mode = require('./mode.js');

exports.load = function(query, args, response)
{
	this.process(query).load(args, response);
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
			code: 404,
			name: 'invalid_path',
			keyword: this.query
		};
		return;
	}
	this.args = this.args();
	
	if(this.extension = mode.extension.extract(this.query))
	{
		if(!(this.type = mode.extension.exists(this.extension)))
		{
			this.error =
			{
				code: 404,
				name: 'invalid_extension',
				keyword: this.extension
			};
			return;
		}
	}
	if(!(this.controller = mode.controller.exists(this.args.controller)))
	{
		this.error =
		{
			code: 404,
			name: 'invalid_controller',
			keyword: this.args.controller
		};
		return;
	}
	if(typeof(this.controller.prototype[this.args.action]) != 'function')
	{
		this.error =
		{
			code: 404,
			name: 'invalid_action',
			keyword: this.args.action
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
Page.prototype.load = function(args, response)
{
	console.log('Loading query: ' + this.query);

	if(this.error)
	{
		mode.error.throw(this.error, response);
	}
	for(var i in args)
	{
		this.args[i] = args[i];
	}
	var controller = new this.controller();

	controller.args = this.args;

	if(typeof(controller.init) == 'function')
	{
		controller.init();
	}
	var output = controller[this.args.action]();

	if(!output)
	{
		// Pour controller.args in view
	}
	response.writeHead(this.args.code || 200,
	{
		'Content-Type': this.type
	});
	response.end(output);
};