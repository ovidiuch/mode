exports.exists = function(name)
{
	return settings.extensions[name || '$'];
};
exports.get = function(query)
{
	var matches = query.match(/\.([^\.]*)$/);
	if(!matches)
	{
		return '';
	}
	return matches[1];
};