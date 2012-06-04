var mode = require('./mode.js');

exports.load = function(query, args, conn)
{
	new this.Path(query).load(args, conn);
};
this.Path = function(query)
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
	
	if(this.extension = mode.extension.extract(this.query))
	{
		if(!(this.type = mode.extension.exists(this.extension)))
		{
			this.error =
			{
				code: 404,
				message: 'Invalid extension ' + this.extension
			};
			return;
		}
	}
	if(!(this.controller = mode.controller.exists(this.args.controller)))
	{
		this.error =
		{
			code: 404,
			message: 'Invalid controller ' + this.args.controller
		};
		return;
	}
	if(typeof(this.controller.prototype[this.args.action]) != 'function')
	{
		this.error =
		{
			code: 404,
			message: 'Invalid action ' + this.args.action
		};
	}
};
this.Path.prototype =
{
	identify: function(routes)
	{
		for(var i in routes)
		{
			if(this.vars = this.query.match(routes[i].pattern))
			{	
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

		if(typeof(this.controller.init) == 'function')
		{
			this.controller.init(function()
			{
				that.callback.call(that);
			});
			return;
		}
		this.callback();
	},
	callback: function()
	{
		console.log('Loading action: ' + this.args.action);

		var that = this;

		this.controller[this.args.action](function(output)
		{
			that.view(output);
		});
	},
	view: function(output)
	{
		if(!output)
		{
			// Pour controller.args in view
		}
		this.conn.response.writeHead(this.args.code || 200,
		{
			'Content-Type': this.type
		});
		mode.server.close(this.conn, output);
	}
};