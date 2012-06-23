var mode = require('./mode.js');

exports.add = function(pattern, args, callback)
{
	if(!(pattern instanceof RegExp))
	{
		pattern = new RegExp('^' + process(pattern, args) + '$', 'i');
	}
	list.push(
	{
		pattern: pattern, args: args, callback: callback
	});
};
exports.match = function(query)
{
	var vars, args;

	for(var i in list)
	{
		if(!(vars = query.match(list[i].pattern)))
		{
			continue;
		}
		args = {};

		for(var j in list[i].args)
		{
			args[j] = list[i].args[j].replace(/\$([0-9]+)/, function()
			{
				return vars[arguments[1]];
			});
		}
		if(list[i].args.redirect)
		{
			return this.match
			(
				mode.mustache.compile(list[i].args.redirect, args)
			);
		}
		if(list[i].callback && !list[i].callback(args))
		{
			continue;
		}
		return args;
	}
	return false;
};
var keywords = exports.keywords =
{
	':': '.+?',
	'@': '[a-z]+',
	'#': '[0-9]+'
};
var list = exports.list = [];

var process = function(pattern, args)
{
	pattern = pattern.replace(/(\.)/g, '\\$1');

	var count = 0;

	return pattern.replace(/(:|@|#)([a-z]+)/ig, function(match, type, name)
	{
		args[name] = '$' + ++count;

		return '(' + keywords[type] + ')';
	});
};