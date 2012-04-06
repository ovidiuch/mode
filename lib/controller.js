var file = require('./file.js');

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
    
    for(var i = 0; i < this.names.length; i++)
    {
        this.classes.push(this.names[i].controller);
    }
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
this.classes = [];