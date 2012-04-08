/*exports.process = function(query)
{
	console.log('asdd');

	return new Page(query);
};

var extension = require('./extension.js');
var controller = require('./controller.js');

var Page = function(query)
{
	this.error = null;

	this.init(query);
};
Page.prototype.url = function()
{

};
Page.prototype.redirect = function()
{

};
Page.prototype.load = function(res)
{
	if(this.error)
	{
		error.throw(this.error);
	}

	console.log(this);

	if(res)
	{
		Page.response = res;
	}
	if(!Page.response)
	{
		return;
	}
	Page.response.writeHead(200,
	{
		'Content-Type': extension.exists(this.extension)
	});
	Page.response.end();
};
Page.prototype.init = function(query)
{
	this.query = query;

	if(Boolean(this.extension = extension.get(this.query)))
	{
		this.query = this.query.substr
		(
			0, this.query.length - (this.extension.length + 1)
		);
	}
	if(!extension.exists(this.extension))
	{
		this.error =
		{
			code: 500,
			name: 'invalid_extension',
			args: { name: this.extension }
		};
		return;
	}
	this.controller = 'main';
	this.action = 'index';

	var parts = this.query.substr(1).split('/');

	if(parts.length >= 2)
	{
		var part1 = parts.slice(0, -2);
		var part2 = parts.slice(-1);

		if(controller.exists(part1, part2))
		{
			this.controller = part1;
			this.action = part2;
		}
	}
	else if(controller.exists(query))
	{
		this.controller = query;
	}
	else if(this.query.substr(1))
	{
		this.error =
		{
			code: 500,
			name: 'invalid_page',
			args: { query: this.query }
		};
	}

	// controller, than action, somehow
};*/