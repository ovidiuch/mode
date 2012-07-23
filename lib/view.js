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

	map[name] = new View(path);
};
exports.exists = function(name)
{
	return map[name];
};
exports.open = function(name, args)
{
	console.log('Opening view: ' + name);

	if(!this.exists(name))
	{
		return false;
	}
	if(!args)
	{
		return map[name].original;
	}
	args.content = map[name].render(args);

	if(!args.layout)
	{
		return args.content;
	}
	var layout = map['layout/' + args.layout];

	if(!layout)
	{
		mode.throw(404, 'Invalid layout ' + args.layout);
	}
	return layout.render(args);
};
var View = function(path)
{
	this.path = path;

	this.original = String(require('fs').readFileSync(this.path));
};
View.prototype =
{
	render: function(args)
	{
		var content = this.original;

		if(mode.extension.extract(this.path) == 'mustache')
		{
			content = mode.mustache.parse(content, args);
		}
		return this.minify(content);
	},
	minify: function(output)
	{
		return output.replace(/\n|\t/g, '').replace(/\s{2,}/g, ' ');
	}
};
var map = {};