var mode = require('./mode.js');

exports.index = function(path)
{
	var files = mode.file.readdir(path, true), name;

	for(var i in files)
	{
		name = mode.file.name(files[i]);

		this.load(name, path + files[i]);
	}
};
exports.load = function(name, path)
{
	console.log('Loading view: ' + name);

	list[name] = new View(path);
};
exports.open = function(name, args)
{
	console.log('Opening view: ' + name);

	if(!list[name])
	{
		return false;
	}
	if(!args)
	{
		return list[name].original;
	}
	args.content = list[name].compile(args);

	if(!args.layout)
	{
		return args.content;
	}
	var layout = list['layout/' + args.layout];

	if(!layout)
	{
		mode.error.throw(
		{
			code: 404, message: 'Invalid layout ' + args.layout
		});
	}
	return layout.compile(args);
};
var View = function(path)
{
	this.path = path;

	this.original = String(require('fs').readFileSync(this.path));
};
View.prototype =
{
	compile: function(args)
	{
		var content = this.original;

		if(mode.extension.extract(this.path) == 'mustache')
		{
			content = mode.mustache.compile(content, args);
		}
		return this.minify(content);
	},
	minify: function(output)
	{
		output = output.replace(/\n|\t/g, '');
		output = output.replace(/\s{2,}/g, ' ');

		return output;
	}
};
var list = {};