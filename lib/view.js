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
exports.get = function(name, args)
{
	console.log('Opening view: ' + name);

	if(!views[name])
	{
		return false;
	}
	if(!args)
	{
		return views[name].original;
	}
	return views[name].compile(args);
};
var View = function(path)
{
	this.path = path;

	this.original = require('fs').readFileSync(this.path);
};
View.prototype =
{
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
		output = output.replace(/\n|\t/g, '');
		output = output.replace(/\s{2,}/g, ' ');

		return output;
	}
};
var views = [];