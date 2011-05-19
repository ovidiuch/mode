exports.exists = function(name)
{
    return settings.extensions[name || '$'];
};