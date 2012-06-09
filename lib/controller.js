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
exports.get = function(name)
{
	return mode.class.get('controller/' + name);
};
exports.action = function(name, controller)
{
	var action = controller.prototype.action[name];

	if(!typeof(action) == 'function')
	{
		return false;
	}
	return action;
};