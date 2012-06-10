var mode = require('./mode.js');

exports.path = function()
{
	return mode.settings.path.app + '/view';
};
exports.index = function()
{
	var path = this.path();

	var files = mode.file.readdir(path, true), name;

	for(var i in files)
	{
		name = mode.file.name(files[i]);

		this.load(path + files[i], name);
	}
};
exports.load = function(path, name)
{
	console.log('Loading view: ' + name);

	views[name] = new View(path);
};
exports.open = function(args)
{
	var name = args.controller + '.' + args.action;

	console.log('Opening view: ' + name)

	if(!views[name])
	{
		return false;
	}
	return views[name].open(args);
}
var View = function(path)
{
	this.path = path;

	this.original = require('fs').readFileSync(this.path);
}
View.prototype =
{
	open: function(args)
	{
		return this.compile(args);
	},
	compile: function(args)
	{
		var contents = this.original;

		if(mode.extension.extract(this.path) == 'mustache')
		{
			contents = mode.mustache.compile(contents, args);
		}
		return this.minify(contents);
	},
	minify: function(output)
	{
		// Remove empty spaces

		return output;
	}
};
var views = [];