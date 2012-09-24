var path = require('./path.js');
/**
 * Start web server.
 *
 * Settings:
 *
 *   - host, defaults to '0.0.0.0'
 *   - post, defaults to 1337
 *
 * Example:
 *
 *     server.start({}, function(conn) {
 *       Console.log('New connection!');
 *     });
 *
 * TODO: Implement "protocol" setting and implement HTTPS
 * and maybe SPDY.
 *
 * @param {object} settings
 * @param {function} callback
 * @return {http.Server}
 * @see Connection
 */
exports.start = function(settings, callback) {
  var defaults = {
    host: '0.0.0.0', port: 1337
  };
  for (var i in defaults) {
    if (!settings[i]) {
      settings[i] = defaults[i];
    }
  }
  console.log('Starting HTTP server...');
  var server = require('http').createServer(function(req, res) {
    console.log('New connection... (' + connections.length + ')');
    req.headers.protocol = 'http:';
    connections.push(new Connection(req, res, callback));
  });
  server.listen(settings.port, settings.host, function() {
    console.log('HTTP server ON.');
  });
  return server;
};
/**
 * Remove connection from list.
 *
 * @param {server.Connection} conn
 * @private
 */
var remove = function(conn) {
  var index = connections.indexOf(conn);
  console.log('Closing connection #' + index);
  if (index != -1) {
    connections.splice(index, 1);
  }
};
/**
 * Connections list.
 *
 * @type {Array}
 * @private
 */
var connections = [];
/**
 * Connection wrapper.
 *
 * @constructor
 * @param {http.ServerRquest} req
 * @param {http.ServerResponse} res
 * @param {function} callback
 * @private
 */
var Connection = function(req, res, callback) {
  this.req = req;
  this.res = res;
  this.init(callback);
};
Connection.prototype = {
  /**
   * Init connection.
   *
   * Starts reading request body for `POST` requests, or fires
   * callback immediately otherwise.
   *
   * @param {function} callback
   * @see #read
   */
  init: function(callback) {
    var conn = this;
    this.res.on('close', function() {
      conn.close();
    });
    this.data = {};
    if (this.req.method == 'POST') {
      this.read(callback);
    } else {
      process.nextTick(function() {
        callback(conn);
      });
    }
  },
  /**
   * Read request body.
   *
   * Gathers and puts together all message body parts received
   * and only fires callback once it has finished.
   *
   * @param {function} callback
   */
  read: function(callback) {
    var conn = this, body = '';
    this.req.on('data', function(data) {
      if ((body += data).length > 1e6) {
        conn.req.connection.destroy();
      }
    });
    this.req.on('end', function() {
      conn.data = path.args(require('querystring').parse(body));
      callback(conn);
    });
  },
  /**
   * Close connection.
   *
   * It first removes itself from the connection list and
   * then ends server response with specified data.
   *
   * @param {buffer|string} data Response body
   * @see server.remove
   */
  close: function(data) {
    remove(this);
    this.res.end(data);
  },
  /**
   * Redirect connection to url.
   *
   * It actually closes connection with the `Location` header
   * set to the new url value.
   *
   * @param {string} url
   * @see #close
   */
  redirect: function(url) {
    this.res.statusCode = 302;
    this.res.setHeader('Location', url);
    this.close();
  }
};