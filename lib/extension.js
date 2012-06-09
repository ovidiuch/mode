var mode = require('./mode.js');

exports.extract = function(query)
{
	var match = query.match(/\.([^\.]+)(\?|$)/);

	if(!match)
	{
		return '';
	}
	return match[1];
};
exports.type = function(name)
{
	return mode.settings.types[name || 'default'];
};