var file = require('./file.js');

var settings = require('../conf/settings.js');

exports.path = function(name)
{
    var path = settings.path.base + '/app/controllers';
    if(!name)
    {
        return path;
    }
    return path + '/' + name + '.js';
};
exports.index = function(callback)
{
    this.names = file.readdir(this.path(), true);
    
    callback(null, this);
};
exports.exists = function(name)
{
    if(this.names.indexOf('/' + name + '.js') == -1)
    {
        return false;
    }
    return true;
};

this.names = [];