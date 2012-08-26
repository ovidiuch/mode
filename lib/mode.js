/**
 * Init core modules.
 *
 * Passing settings at this point is completely optional as
 * they can or might be overriden later on.
 *
 * Example:
 *
 *     var mode = require('mode');
 *     mode.init();
 *
 * @param {object} settings
 * @see mode.file.index
 * @see mode.class.index
 */
exports.init = function(settings) {
  console.log('Initializing mode...');
  var mode = this;
  require('./file.js').index(__dirname, false, function(path, module) {
    if (module == mode) {
      return;
    }
    console.log('Loading module: ' + path);
    require('./path.js').parse(path, module);
  });
  mode.class.index(__dirname + '/class');
  mode.settings = settings || {};
  mode.helper = {};
};
/**
 * Setup applicaton folder.
 *
 * Items are indexed in the following order:
 *
 *   - config files
 *   - lib modules
 *   - app classes
 *   - app helpers
 *   - app views
 *
 * TODO: Investigate if lib should be loaded before config.
 * TODO: Create a callback system for initializing template
 * engines with helpers.
 *
 * Example:
 *
 *     // Setup app in current folder
 *     mode.setup(__dirname);
 *
 * @param {string} path Application path
 * @see mode.file.index
 * @see mode.class.index
 * @see mode.view.index
 */
exports.setup = function(path) {
  console.log('Loading app: ' + path);
  path = this.settings.path = {
    base: path
  };
  var dirs = ['app', 'conf', 'lib'];
  for (var i in dirs) {
    if (!path[dirs[i]]) {
      path[dirs[i]] = path.base + '/' + dirs[i];
    }
  }
  var mode = this;
  this.file.index(path.conf, true, function(path) {
    console.log('Loading config: ' + path);
  });
  this.file.index(path.lib, false, function(path, module) {
    console.log('Loading module: ' + path);
    mode.path.parse(path, module);
  });
  var types = path.types || ['model', 'controller'];
  for (var i in types) {
    this.class.index(path.app, types[i]);
  }
  this.file.index(path.app + '/helper', true, function(path) {
    console.log('Loading helper: ' + path);
  });
  this.mustache.init(this.helper);
  this.view.index(path.app + '/view');
};
/**
 * Start application.
 *
 * It first attempts to start a database connection, if settings
 * for one are present, after which the server is started.
 *
 * Server settings should be omitted if an app folder has been
 * setup and a config file with them was loaded separately, or
 * if they were already set at _mode.init_.
 *
 * Example:
 *
 *     // Start mode on specific port and custom callback
 *     mode.start({port: 1337}, function(path, args, conn) {
 *       conn.close('You are trying to open: ' + path);
 *     });
 *
 * @param {object} Server settings
 * @param {Function} callback
 * @see mode.server.start
 * @see mode.model.init
 * @see #request
 */
exports.start = function(settings, callback) {
  if (settings) {
    this.settings.server = settings;
  }
  var mode = this, start = function() {
    mode.server.start(mode.settings.server, function(conn) {
      request.call(mode, conn, callback);
    });
  };
  if (this.settings.db && !this.settings.db.adaptor.conn) {
    this.model.init(this.settings.db, function() {
      start();
    });
  } else {
    start();
  }
};
/**
 * Server request handler.
 *
 * A callback will be fired upon new requests if one is
 * specified, otherwise the path module will attempt to load
 * a matching route and controller action.
 *
 * In the case of the latter, each request is wrapper around
 * a new domain that handles its exceptions separately.
 *
 * TODO: Create a callback system for registering modules
 * to server connections. E.g. cookie and session
 *
 * @param {mode.Connection} conn Server connection
 * @param {Function} callback
 * @see mode.path.load
 * @private
 */
var request = function(conn, callback) {
  var url = require('url').parse(conn.req.url, true);
  console.log('Loading path: ' + url.pathname);
  this.cookie.init(conn.req, conn.res);
  this.session.init(conn.req);
  var mode = this, args = this.path.args(url.query);
  if (callback) {
    callback(url.pathname, args, conn);
  } else if (this.path) {
    var domain = conn.domain = require('domain').create();
    domain.on('error', function(error) {
      mode.error.handle(error, conn);
    });
    domain.run(function() {
      mode.path.load(url.pathname, args, conn);
    });
  }
};