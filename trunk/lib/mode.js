var settings = require('../conf/settings.js');
var server = require('./server.js');
var path = require('./path.js');

exports.start = function()
{
    server.start({
        hostname: settings.server.hostname,
        port: settings.server.port,
        callback: this.onConnection
    });
    
    console.log('Mode.js ready.');
};
exports.onConnection = function(req, res)
{
    var url = require('url').parse(req.url, true);    
    var page = path.process(url.pathname);
    
    console.log(page);
    
    res.writeHead(200,
    {
        'Content-Type': settings.extensions[page.extension]
    });
    res.end();
};