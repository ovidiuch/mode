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
		this.load(require(path + files[i]).class, name)
	}
};
exports.load = function(prototype, name)
{
	console.log('Loading class: ' + name);

	classes[name] = prototype;
};
exports.exists = function(name)
{
	return classes[name];
};
exports.build = function()
{
	for(var i in classes)
	{
		this.make(i);
	}
};
var classes = [];

this.make = function(name)
{
	var prototype = classes[name];

	if(prototype.class)
	{
		return prototype;
	}
	console.log('Making class: ' + name);

	var fn = function(){};

	fn.prototype = new prototype(mode);

	if(fn.prototype.super)
	{
		prototype = this.make(fn.prototype.super).prototype;

		for(var i in prototype)
		{
			if(!fn.prototype[i])
			{
				fn.prototype[i] = prototype[i];
			}
		}
		fn.prototype.super = prototype;
	}
	fn.class = true;

	return classes[name] = fn;
};