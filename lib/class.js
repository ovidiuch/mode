var mode = require('./mode.js');

exports.name = function(file)
{
	return file.replace(/^\/(.+).js$/, '$1');
};
exports.index = function(path, prefix)
{
	var files = mode.file.readdir(path, true), name;

	for(var i in files)
	{
		name = this.name(files[i]);

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
		this.make(i);
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
	return this.make(name);
};
var classes = [];

this.make = function(name, copy)
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

	var fn = function(){};

	if(module.super)
	{
		prototype = new (this.make(module.super, true))();

		for(var i in prototype)
		{
			module.class.prototype[i] = prototype[i];
		}
		fn.prototype.super = prototype;
	}
	fn.prototype = new module.class(mode);

	if(!copy)
	{
		classes[name].build = fn;
	}
	return fn;
};