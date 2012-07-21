var mode = require('./mode.js');

exports.init = function(prototype)
{
	ScopeArguments.prototype = prototype;
};
exports.parse = function(body, args)
{
	return new Scope(args).process(body);
};
var Scope = function(args, subject)
{
	this.args = new ScopeArguments(args);

	this.args.this = subject;

	if(typeof(subject) == 'object' && subject.length == undefined)
	{
		for(var i in subject)
		{
			this.args[i] = subject[i];
		}
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
		var subject = this.member(name);

		if(typeof(subject) == 'undefined')
		{
			return '';
		}
		if(open.length > 2)
		{
			return subject;
		}
		return this.escape(subject);
	},
	start: function(match, type, name, body)
	{
		var that = this, pattern = new RegExp
		(
			'([\\S\\s]*?){{/(' + name.split(' ')[0] + ')}}([\\S\\s]*)$'
		);
		return body.replace(pattern, function(match, body, end, rest)
		{
			return that.section(body, name, type) + that.process(rest);
		});
	},
	section: function(body, name, type)
	{
		var subject = this.member(name);

		if(type == '^')
		{
			subject = !subject;
		}
		if(!subject)
		{
			return '';
		}
		if(typeof(subject) == 'object' && subject.length != undefined)
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
	partial: function(match, name)
	{
		return mode.view.open('partial/' + name) || '';
	},
	member: function(name)
	{
		/*
			Split member name by space, to extract any
			additional params present
		*/
		var params = name.split(' ');
		/*
			Extract the first of the params list and split
			it, by dot, into hierarchical keys
		*/
		var keys = params.shift().split('.'), key;
		/*
			Init subject as the args pool
		*/
		var subject = this.args, parent;
		/*
			Consume key list, until it returns a negative value
		*/
		while(key = keys.shift())
		{
			/*
				Set parent to current subject, before replacing it
			*/
			parent = subject;
			/*
				Advance another level with the subject, but break
				loop if the outcome is negative, because it would 
				prevent further iteration
			*/
			if(!(subject = subject[key]))
			{
				break;
			}
		}
		/*
			Set subject to its returned value, if function
		*/
		if(typeof(subject) == 'function')
		{
			/*
				Call function on with parent subject as scope,
				and with the processed list of params, if any
			*/
			subject = subject.apply(parent, this.params(params));
		}
		return subject;
	},
	params: function(list)
	{
		var members = [];

		for(var i = 0; i < list.length; i++)
		{
			members[i] = this.args[list[i]];
		}
		return members;
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
var ScopeArguments = function(args)
{
	for(var i in args)
	{
		this[i] = args[i];
	}
};
var tags =
[
	/* {{> partial}} */

	{ pattern: /{{> ([a-z0-9_\.-]+)}}/ig, callback: 'partial' },

	/* {{#section}}...{{/section}} */

	{ pattern: /{{(#|\^)([a-z0-9_\.\ ]+)}}([\S\s]*)$/ig, callback: 'start' },

	/* {{variable}} */

	{ pattern: /({{{?)([a-z0-9_\.\ ]+)(}}}?)/ig, callback: 'variable' }
];