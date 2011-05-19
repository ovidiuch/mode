var fs = require('fs');

var error = require('./error.js');
var server = require('./server.js');
var path = require('./path.js');

var extension = require('./extension.js');
var controller = require('./controller.js');

var settings = require('../conf/settings.js');

exports.start = function()
{
    var self = this;
    
    settings.path.base = fs.realpathSync(__dirname + '/../');
    
    process.on('uncaughtException', function(e)
    {
        error.handle(e);
    });
    require('./index.js').init([controller], function()
    {
        server.start({
            hostname: settings.server.hostname,
            port: settings.server.port,
            callback: self.request
        });
    });
};

exports.load = function(page)
{
   
};

this.request = function(req, res)
{
    var url = require('url').parse(req.url, true);    
    var page = path.process(url.pathname);
    
    console.log(page);
    
    res.writeHead(200,
    {
        'Content-Type': extension.exists(page.extension)
    });
    res.end();
};
