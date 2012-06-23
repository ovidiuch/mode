var mode = require('./mode.js');

exports.load = function(query, args, conn)
{
	new Path(query).load(args, conn);
};
var Path = function(query)
{
	this.error = this.init(query);
};
Path.prototype =
{
	init: function(query)
	{
		this.query = query;

		if(!(this.args = mode.route.match(this.query)))
		{
			return 'Invalid path ' + this.query;
		}
		this.type = mode.extension.type
		(
			this.extension = mode.extension.extract(this.query)
		);
		if(!this.type)
		{
			return 'Invalid extension ' + this.extension;
		}
		this.controller = mode.controller.get(this.args.controller);
		
		if(!this.controller)
		{
			return 'Invalid controller ' + this.args.controller;
		}
		this.action = mode.controller.action
		(
			this.args.action, this.controller
		);
		if(!this.action)
		{
			return 'Invalid action ' + this.args.action;
		}
		return null;
	},
	load: function(args, conn)
	{
		if(this.error)
		{
			mode.error.throw(
			{
				code: 404, message: this.error
			},
			conn);
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
			this.controller.action.init.call(this.controller, function()
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
		if(!output && typeof(output) != 'string')
		{
			var name = this.args.controller + '.' + this.args.action;

			if(!(output = mode.view.open(name, this.args)))
			{
				mode.error.throw(
				{
					code: 404, message: 'Invalid view ' + name
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