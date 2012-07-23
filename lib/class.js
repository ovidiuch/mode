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
var Base = exports.Base = function()
{
	this.static = Base;
};
Base.children = [];
Base.abstract = true;

Base.extend = function(constructor, abstract)
{
	/*
		Define the class function
	*/
	var Class = function()
	{
		/*
			Since all instances of a JavaScript function
			share its prototype, non-function members need
			to be cloned and reassigned manually every time
			a new instance is created
		*/
		for(var i in Class.prototype)
		{
			this[i] = clone(Class.prototype[i]);
		}
		/*
			Call user-defined constructor, if defined
		*/
		if(typeof(this.instance) == 'function')
		{
			this.instance.apply(this, arguments);
		}
	};
	/*
		Copy all of the parent's prototype properties
		into the prototype of the constructor function
	 */
	for(var i in this.prototype)
	{
		constructor.prototype[i] = clone(this.prototype[i]);
	}
	/*
		Store static class reference in constructor prototype
	*/
	constructor.prototype.static = Class;
	/*
		Generate class prototype by instanciating the class
		constructor
		Also send instance of the parent class as first param
	*/
	Class.prototype = new constructor(new this());
	/*
		Copy all of the parent's static properties
		into the class function directly
	 */
	for(var i in this)
	{
		Class[i] = clone(this[i]);
	}
	/*
		Init internal class properties
	*/
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