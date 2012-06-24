var mode = require('./mode.js');

exports.index = function(path, prefix)
{
	mode.file.index(path, true, function(name, module)
	{
		if(prefix)
		{
			name = prefix + '/' + name;
		}
		console.log('Loading class: ' + name);
	});
};
exports.get = function(path, scope)
{
	scope = scope || mode;

	var parts = path.split('/');

	while(parts.length > 1)
	{
		if(!(scope = scope[parts.shift()]))
		{
			return false;
		}
	}
	return scope[name(parts.pop())];
};
var Base = function()
{
	this.static = Base;
};
Base.extend = function(constructor)
{
	var instance = new this(), def = function(){};

	for(var i in instance)
	{
		constructor.prototype[i] = clone(instance[i]);
	}
	constructor.prototype.static = def;

	def.prototype = new constructor(instance);

	for(var i in this)
	{
		if(i != 'abstract')
		{
			def[i] = clone(this[i]);
		}
	}
	return def;
};
exports.Base = Base;

var clone = function(value)
{
	if(typeof(value) != 'object' || value.length)
	{
		return value;
	}
	var copy = {};

	for(var i in value)
	{
		copy[i] = clone(value[i]);
	}
	return copy;
};
var name = function(slug)
{
	return slug.replace(/(^|-)([a-z]{1})/g, function(match, before, letter)
	{
		return letter.toUpperCase();
	});
};