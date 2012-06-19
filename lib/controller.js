var mode = require('./mode.js');

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