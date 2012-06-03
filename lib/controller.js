var mode = require('./mode.js');

exports.path = function(name, file)
{
	var path = mode.settings.path.base + '/app/controller';

	if(!name)
	{
		return path;
	}
	if(!file)
	{
		return path + '/' + name + '.js';
	}
	return path + name;
};
exports.index = function(callback)
{
	this.names = [];
	this.items = [];

	this.names = mode.file.readdir(this.path());

	for(var i = 0; i < this.names.length; i++)
	{
		console.log('Loading controller: ' + this.names[i]);

		this.items.push
		(
			require(this.path(this.names[i], true)).controller
		);
	}
	callback(null, this);
};
exports.exists = function(name, instance)
{
	var index = this.names.indexOf('/' + name + '.js');
	
	return index != -1 ? this.items[index] : false;
};