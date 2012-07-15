var mode = require('./mode.js');

exports.load = function(query, args, conn)
{
	new Path(query, conn.req.method).load(args, conn);
};
exports.redirect = function(query, args, conn)
{
	new Path(query).redirect(args, conn);
};
exports.args = function(vars)
{
	var data = {}, child, keys, k;

	for(var key in vars)
	{
		if(key.indexOf('.') == -1)
		{
			data[key] = vars[key];

			continue;
		}
		keys = key.split('.');

		while(keys.length > 1)
		{
			if(!data[k = keys.shift()])
			{
				data[k] = {};
			}
			child = data[k];
		}
		child[keys.pop()] = vars[key];
	}
	return data;
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
		if(this.external = Boolean(this.query.match(/^[a-z0-9]+:/)))
		{
			return null;
		}
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
		if(this.external)
		{
			this.error = 'Invalid path ' + this.query;
		}
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
		this.controller.data = this.conn.data;

		var that = this;

		var callback = mode.callback.create(function()
		{
			that.action();
		},
		this.controller);
		
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

		var that = this;

		var callback = mode.callback.create(function(response)
		{
			that.view(response);
		},
		this.controller);
		
		callback.domain = this.conn.domain;

		var response = this.controller[this.args.action](callback);

		if(!callback.bound && !callback.done)
		{
			callback.respond(response);
		}
	},
	view: function(output)
	{
		if(typeof(output) == 'string')
		{
			output = mode.mustache.compile(output, this.args);
		}
		var name;

		if(!output && typeof(output) != 'string')
		{
			name = this.args.controller + '/' + this.args.action;
		}
		else if(typeof(output) == 'string' && mode.view.exists(output))
		{
			name = output;
		}
		if(name && !(output = mode.view.open(name, this.args)))
		{
			mode.error.throw(
			{
				code: 404, message: 'Invalid view ' + name
			});
		}
		this.conn.close(output, this.args.code,
		{
			'Content-Type': this.type
		});
	},
	redirect: function(args, conn)
	{
		if(this.error)
		{
			mode.error.throw(
			{
				code: 500, message: this.error
			});
		}
		console.log('Redirecting to: ' + this.query);

		var url = this.query, headers = conn.req.headers;

		if(!this.external)
		{
			url = headers.protocol + '//' + headers.host + url;
		}
		if(args = require('querystring').stringify(args))
		{
			url += '?' + args;
		}
		conn.redirect(url);
	}
};