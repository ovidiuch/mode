var mode = require('./mode.js');

exports.index = function(path, prefix)
{
	if(prefix)
	{
		path += '/' + prefix;
	}
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
Base.children = [];
Base.abstract = true;

Base.extend = function(constructor, abstract)
{
	var instance = new this(), Class = function()
	{
		if(typeof(this.instance) == 'function')
		{
			this.instance.apply(this, arguments);
		}
	};
	for(var i in instance)
	{
		constructor.prototype[i] = clone(instance[i]);
	}
	constructor.prototype.static = Class;

	Class.prototype = new constructor(instance);

	for(var i in this)
	{
		Class[i] = clone(this[i]);
	}
	Class.children = [];
	Class.abstract = Boolean(abstract);

	propagate(Class, Class.parent = this);

	return Class;
};
exports.Base = Base;

var propagate = function(Class, parent)
{
	if(parent.parent)
	{
		propagate(Class, parent.parent);
	}
	parent.children.push(Class);
};
var clone = function(value)
{
	if(!value || typeof(value) != 'object' || value.length)
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