exports.process = function(path)
{
    var page = new Page();
    
    page.extension = this.extension(path);
    page.parts = this.parts(path, page.extension);
    
    page.init();
    
    return page;
};
exports.extension = function(path)
{
    var matches = path.match(/\.([^\.]*)$/);
    if(matches)
    {
        return matches[1];
    }
    return '';
};
exports.parts = function(path, extension)
{
    if(extension)
    {
        path = path.substr(0, path.length - (extension.length + 1));
    }
    return path.substr(1).split('/');
};

var error = require('./error.js');
var extension = require('./extension.js');

var Page = function(){};

Page.prototype.init = function()
{
    if(!extension.exists(this.extension))
    {
        error.throw({
           code: 500,
           name: 'invalid_extension',
           args: { name: this.extension }
        });
    }
};
