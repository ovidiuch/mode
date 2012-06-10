exports.compile = function(body, args)
{
	return new Scope(args).process(String(body));
};
var Scope = function()
{
	this.args = {};

	for(var i in arguments)
	{
		for(var j in arguments[i])
		{
			this.args[j] = arguments[i][j];
		}
		this.args['this'] = arguments[i];
	}
};
Scope.prototype =
{
	process: function(body)
	{
		var that = this;

		for(var i in tags)
		{
			body = body.replace(tags[i].pattern, function()
			{
				return that[tags[i].callback].apply(that, arguments);
			});
		}
		return body;
	},
	variable: function(match, open, name, close)
	{
		if(typeof(this.args[name]) == 'undefined')
		{
			return '';
		}
		if(open.length > 2)
		{
			return this.args[name];
		}
		return this.escape(this.args[name]);
	},
	start: function(match, type, name, body)
	{
		var that = this, pattern = new RegExp
		(
			'([\\S\\s]*){{/(' + name + ')}}([\\S\\s]*)$'
		);
		return body.replace(pattern, function(match, body, name, rest)
		{
			return that.section(body, name, type) + that.process(rest);
		});
	},
	section: function(body, name, type)
	{
		var subject = this.args[name];

		if(type == '^')
		{
			subject = !subject;
		}
		if(!subject)
		{
			return '';
		}
		if(typeof(subject) == 'object' && subject.length)
		{
			var section = '';

			for(var i in subject)
			{
				section += new Scope(this.args, subject[i]).process(body);
			}
			return section;
		}
		return new Scope(this.args, subject).process(body);
	},
	escape: function(text)
	{
		var chars =
		{
			'&': 'amp',
			'<': 'lt',
			'>': 'gt',
			'"': 'quot',
			"'": '#039'
		};
		text = String(text);

		for(var i in chars)
		{
			text = text.replace
			(
				new RegExp(i, 'g'), '&' + chars[i] + ';'
			);
		}
		return text;
	}
};
var tags =
[
	/* TODO: {{> partial}} */

	/* {{#section}}...{{/section}} */

	{ pattern: /{{(#|\^)(.+?)}}([\S\s]*)$/g, callback: 'start' },

	/* {{variable}} */

	{ pattern: /({{{?)(.+?)(}}}?)/g, callback: 'variable' }
];