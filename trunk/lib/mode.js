var fs = require('fs');

var settings = require('../conf/settings.js');

var error = require('./error.js');
var server = require('./server.js');
var path = require('./path.js');

exports.start = function()
{
    process.on('uncaughtException', function(e)
    {
        error.handle(e);
    });
    
    server.start({
        hostname: settings.server.hostname,
        port: settings.server.port,
        callback: this.onConnection
    });
    
    console.log('Mode.js ready.');
};

var extension = require('./extension.js');

exports.onConnection = function(req, res)
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

exports.load = function(page)
{
    
};