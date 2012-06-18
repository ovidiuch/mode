var mode = require('./mode.js');

exports.load = function(query, args, conn)
{
	new Path(query).load(args, conn);
};
var Path = function(query)
{
	this.query = query;

	if(!this.identify(mode.routes.list))
	{
		this.error =
		{
			code: 404,
			message: 'Invalid path ' + this.query
		};
		return;
	}
	this.args = this.args();
	
	this.type = mode.extension.type
	(
		this.extension = mode.extension.extract(this.query)
	);
	if(!this.type)
	{
		this.error =
		{
			code: 404,
			message: 'Invalid extension ' + this.extension
		};
		return;
	}
	this.controller = mode.controller.get(this.args.controller);
	
	if(!this.controller)
	{
		this.error =
		{
			code: 404,
			message: 'Invalid controller ' + this.args.controller
		};
		return;
	}
	this.action = mode.controller.action
	(
		this.args.action, this.controller
	);
	if(!this.action)
	{
		this.error =
		{
			code: 404,
			message: 'Invalid action ' + this.args.action
		};
	}
};
Path.prototype =
{
	identify: function(routes)
	{
		for(var i in routes)
		{
			if(this.vars = this.query.match(routes[i].pattern))
			{
				if(routes[i].redirect)
				{
					this.query = routes[i].redirect;

					return this.identify(routes);
				}
				return (this.route = routes[i]);
			}
		}
	},
	args: function()
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
	},
	load: function(args, conn)
	{
		console.log('Loading query: ' + this.query);

		if(this.error)
		{
			mode.error.throw(this.error, conn);
		}
		for(var i in args)
		{
			this.args[i] = args[i];
		}
		console.log('Loading controller: ' + this.args.controller);

		this.controller = new this.controller();

		this.controller.args = this.args;
		this.controller.conn = this.conn = conn;

		var that = this;

		if(typeof(this.controller.action.init) == 'function')
		{
			this.controller.action.init(function()
			{
				that.callback();
			});
			return;
		}
		this.callback();
	},
	callback: function()
	{
		console.log('Loading action: ' + this.args.action);

		var that = this;

		this.action.call(this.controller, function(response)
		{
			that.view(response);
		});
	},
	view: function(output)
	{
		if(typeof(output) != 'string')
		{
			var name = this.args.controller + '.' + this.args.action;

			if(!(output = mode.view.get(name, this.args)))
			{
				mode.error.throw(
				{
					code: 404, message: 'View missing'
				});
			}
		}
		this.conn.response.writeHead(this.args.code || 200,
		{
			'Content-Type': this.type
		});
		mode.server.close(this.conn, output);
	}
};