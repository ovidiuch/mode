var mode = require('./mode.js');

exports.load = function(query, args, conn)
{
	new Path(query, conn.request.method).load(args, conn);
};
var Path = function(query, method)
{
	this.method = method || 'GET';

	this.error = this.init(this.query = query);
};
Path.prototype =
{
	init: function()
	{
		if(!(this.args = mode.route.match(this.query, this.method)))
		{
			return 'Invalid request ' + this.query;
		}
		this.type = mode.extension.type
		(
			this.extension = mode.extension.extract(this.query)
		);
		if(!this.type)
		{
			return 'Invalid extension ' + this.extension;
		}
		this.controller = mode.class.get(this.args.controller, mode.controller);
		
		if(!this.controller || this.controller.abstract)
		{
			return 'Invalid controller ' + this.args.controller;
		}
		if(typeof(this.controller.prototype[this.args.action]) != 'function')
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
			});
		}
		for(var i in args)
		{
			if(!this.args[i])
			{
				this.args[i] = args[i];
			}
		}
		this.conn = conn;

		console.log('Loading controller: ' + this.args.controller);

		this.controller = new this.controller();

		this.controller.args = this.args;
		this.controller.conn = this.conn;

		var that = this, callback = mode.callback.create(function()
		{
			that.action();
		});
		callback.domain = this.conn.domain;

		if(typeof(this.controller.init) == 'function')
		{
			this.controller.init(callback);
		}
		if(!callback.bound && !callback.done)
		{
			callback.respond();
		}
	},
	action: function()
	{
		console.log('Loading action: ' + this.args.action);

		var that = this, callback = mode.callback.create(function(response)
		{
			that.view(response);
		});
		callback.domain = this.conn.domain;

		var response = this.controller[this.args.action](callback);

		if(!callback.bound && !callback.done)
		{
			callback.respond(response);
		}
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