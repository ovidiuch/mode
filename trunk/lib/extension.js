var extensions = require('../conf/settings.js').extensions;

exports.exists = function(name)
{
    return extensions[name || '$'];
};