var fs = require('fs');

exports.readdir = function(path, reccuring, ns)
{
	try
	{
		if(!fs.statSync(path).isDirectory())
		{
			return [];
		}
	}
	catch(e)
	{
		return [];
	}
	ns = ns || '';

	var all = [];
	var files = fs.readdirSync(path);
	var subfiles = [];

	for(var i = 0, j, subpath; i < files.length; i++)
	{
		subpath = path + '/' + files[i];

		if(!fs.statSync(subpath).isDirectory())
		{
			all.push(ns + '/' + files[i]);

			continue;
		}
		if(reccuring)
		{
			subfiles = this.readdir
			(
				subpath, true, ns + '/' + files[i]
			);
			for(j = 0; j < subfiles.length; j++)
			{
				all.push(subfiles[j]);
			}
		}
	}
	return all;
};