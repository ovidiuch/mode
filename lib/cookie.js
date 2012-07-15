exports.init = function(req, res)
{
	return new Group(req, res);
};
var Group = function(req, res)
{
	this.req = req;
	this.res = res;

	this.map = {};

	var parts, list = req.headers.cookie.split(';');

	for(var i in list)
	{
		parts = list[i].trim().split('=');

		this.map[parts[0]] = new Cookie(
		{
			name: parts[0], value: parts[1]
		});
	}
	req.cookie = this;
};
Group.prototype =
{
	get: function(name)
	{
		if(!this.map[name])
		{
			return;
		}
		return this.map[name].value;
	},
	set: function(args)
	{
		if(!args.name)
		{
			return;
		}
		args.new = true;

		this.map[args.name] = new Cookie(args);

		this.update();
	},
	update: function()
	{
		var list = [];

		for(var i in this.map)
		{
			if(this.map[i].new)
			{
				list.push(String(this.map[i]));
			}
		}
		this.res.setHeader('Set-Cookie', list);
	}
};
var Cookie = function(args)
{
	for(var i in args)
	{
		this[i] = !args.new ? this.decode(args[i]) : args[i];
	}
};
Cookie.prototype =
{
	toString: function()
	{
		var parts = [this.encode(this.name) + '=' + this.encode(this.value)];

		if(this.duration)
		{
			var date = new Date();

			date.setTime(date.getTime() + this.duration * 1000);

			parts.push('Expires=' + date.toGMTString());
		}
		if(this.domain)
		{
			parts.push('Domain=' + this.domain);
		}
		if(this.path)
		{
			parts.push('Expires=' + this.path);
		}
		if(this.secure)
		{
			parts.push('Secure');
		}
		if(this.httpOnly)
		{
			parts.push('HttpOnly');
		}
		return parts.join('; ');
	},
	encode: function(value)
	{
		if(typeof(value) != 'string')
		{
			return value;
		}
		return encodeURIComponent(value);
	},
	decode: function(value)
	{
		if(typeof(value) != 'string')
		{
			return value;
		}
		return decodeURIComponent(value);
	}
};