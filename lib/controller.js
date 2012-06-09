var mode = require('./mode.js');

exports.path = function()
{
	return mode.settings.path.app + '/controller';
};
exports.index = function()
{
	var path = mode.settings.path.lib + '/class/base.controller.js';

	mode.class.load
	(
		require(path), 'controller/base'
	);
	mode.class.index(this.path(), 'controller');
};
exports.exists = function(name)
{
	return mode.class.exists('controller/' + name);
};