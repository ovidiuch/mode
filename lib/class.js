var mode = require('./mode.js');

exports.index = function(path, prefix)
{
	var files = mode.file.readdir(path, true), name;

	for(var i in files)
	{
		name = mode.file.name(files[i]);

		if(prefix)
		{
			name = prefix + '/' + name;
		}
		this.load(require(path + files[i]), name)
	}
};
exports.build = function()
{
	for(var i in classes)
	{
		make(i);
	}
};
exports.load = function(module, name)
{
	console.log('Loading class: ' + name);

	classes[name] = module;
};
exports.get = function(name)
{
	if(!classes[name])
	{
		return false;
	}
	return make(name);
};
var classes = [];

var make = function(name, copy)
{
	var module = classes[name];

	if(!copy)
	{
		if(module.abstract)
		{
			return false;
		}
		if(typeof(module.build) == 'function')
		{
			return module.build;
		}
	}
	console.log('Making class: ' + name);

	var parent, fn = function(){};

	if(module.super)
	{
		parent = new (make(module.super, true))();

		for(var i in parent)
		{
			module.class.prototype[i] = clone(parent[i]);
		}
		module.class.prototype.parent = parent;
	}
	fn.prototype = new module.class(mode, parent);

	if(!copy)
	{
		module.build = fn;
	}
	return fn;
};
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