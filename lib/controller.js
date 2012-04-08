var mode = require('./mode.js');

exports.path = function(name)
{
	var path = mode.settings.path.base + '/app/controller';

	if(!name)
	{
		return path;
	}
	return path + '/' + name + '.js';
};
exports.index = function(callback)
{
	this.names = [];
	this.items = [];

	this.names = mode.file.readdir(this.path());

	for(var i = 0; i < this.names.length; i++)
	{
		this.items.push(this.names[i].controller); // to be continued...
	}
	callback(null, this);
};
exports.exists = function(name)
{
	return this.names.indexOf('/' + name + '.js') != -1;
};