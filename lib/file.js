var fs = require('fs');
var path = require('path');

exports.name = function(path)
{
	return path.replace(/^\/(.+)\..+$/, '$1');
};
exports.readdir = function(location, recursive, ns)
{
	if(!path.existsSync(location))
	{
		return [];
	}
	if(!fs.statSync(location).isDirectory())
	{
		return [];
	}
	var files = fs.readdirSync(location);

	if(!files.length)
	{
		return [];
	}
	ns = ns || '';

	var all = [];

	for(var i = 0, j, file, children; i < files.length; i++)
	{
		file = location + '/' + files[i];

		if(!fs.statSync(file).isDirectory())
		{
			if(!files[i].match(/^\./))
			{
				all.push(ns + '/' + files[i]);
			}
			continue;
		}
		if(!recursive)
		{
			continue;
		}
		children = this.readdir
		(
			file, recursive, ns + '/' + files[i]
		);
		for(j = 0; j < children.length; j++)
		{
			all.push(children[j]);
		}
	}
	return all;
};