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
	/*
		Create instance of extended class (parent)
	*/
	var instance = new this();
	/*
		Copy all of the parent's instance properties
		into the prototype of the definition function
	 */
	for(var i in instance)
	{
		constructor.prototype[i] = clone(instance[i]);
	}
	/*
		Generate prototype of new class by calling the
		class definition as a constructor function
	*/
	var prototype = new constructor(instance);
	/*
		Define the class constructor
	*/
	var Class = function()
	{
		/*
			Since all instances of a JavaScript function
			share its prototype, non-function members need
			to be cloned and reassigned manually every time
			a new instance is created
		*/
		for(var i in prototype)
		{
			if(typeof(this[i]) != 'function')
			{
				this[i] = clone(prototype[i]);
			}
		}
		/*
			Store a static class reference inside instance
		*/
		this.static = Class;
		/*
			Call user-defined constructor, if defined
		*/
		if(typeof(this.instance) == 'function')
		{
			this.instance.apply(this, arguments);
		}
	};
	/*
		Assign previously generated prototype to
		constructor function
	*/
	Class.prototype = prototype;
	/*
		Copy all of the parent's static properties
		into the class constructor directly
	 */
	for(var i in this)
	{
		Class[i] = clone(this[i]);
	}
	Class.children = [];
	Class.abstract = Boolean(abstract);
	/*
		Populate children list recursively, while
		storing a static reference to parent class
	*/
	propagate(Class, Class.parent = this);
	/*
		Return generated class
	*/
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