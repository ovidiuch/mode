var domain = require('domain'),
    url = require('url'),
    cookie = require('./cookie.js'),
    extension = require('./extension.js'),
    error = require('./error.js'),
    file = require('./file.js'),
    path = require('./path.js'),
    model = require('./model.js'),
    mustache = require('./mustache.js'),
    route = require('./route.js'),
    server = require('./server.js'),
    session = require('./session.js'),
    view = require('./view.js');
/**
 * @class Main class
 */
var Mode = require('./class/base.js').extend(function() {
  this.settings = {};
  this.module = {};
  this.model = {};
  this.controller = {};
  this.helper = {};
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
   * @see file.index
   * @see class.index
   * @see path.parse
   */
  this.init = function(settings) {
    console.log('Initializing mode...');
    if (settings) {
      this.settings = settings;
    }
    this.class = require('./class.js');
    file.index(__dirname, false, this.bind(function(query, module) {
      if (module != this) {
        console.log('Loading module: ' + query);
        path.parse(query, this.module, module);
      }
    }));
    var types = ['class', 'model', 'controller'];
    types.forEach(this.bind(function(type) {
      this.class.index(__dirname, this, type);
    }));
    this.emit('init');
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
   * TODO: Investigate if config and helpers should be tied
   * automatically to the global _mode_ object
   *
   * Example:
   *
   *     // Setup app in current folder
   *     mode.setup(__dirname);
   *
   * @param {string} basePath Application path
   * @see file.index
   * @see class.index
   * @see view.index
   */
  this.setup = function(basePath) {
    console.log('Loading app: ' + basePath);
    var p = this.settings.path = {
      base: basePath
    };
    var dirs = ['app', 'conf', 'lib'];
    dirs.forEach(function(dir) {
      if (!p[dir]) {
        p[dir] = p.base + '/' + dir;
      }
    });
    file.index(p.conf, true, function(query) {
      console.log('Loading config: ' + query);
    });
    file.index(p.lib, false, this.bind(function(query, module) {
      console.log('Loading module: ' + query);
      path.parse(query, this.module, module);
    }));
    var types = p.types || ['model', 'controller'];
    types.forEach(this.bind(function(type) {
      this.class.index(p.app, this, type);
    }));
    file.index(p.app + '/helper', true, function(query) {
      console.log('Loading helper: ' + query);
    });
    view.index(p.app + '/view');
    this.emit('setup');
  };
  /**
   * Start application server.
   *
   * Server settings should be omitted if an app folder has been
   * setup and a config file with them was loaded separately, or
   * if they were already set at _mode.init_.
   *
   * Sending a request callback as the second parameter is the
   * equivalent of `mode.on('request')`, except that the
   * internal `request` handler (that handles requests via the
   * _path_ module) will then be removed. This way server
   * requests can be processed in any custom way.
   *
   * Example:
   *
   *     // Start mode on specific port and custom callback
   *     mode.start({port: 1337}, function(path, args, conn) {
   *       conn.close('You are trying to open: ' + path);
   *     });
   *
   * @param {object} settings Server settings
   * @param {function} callback Custom request callback
   * @see server.start
   */
  this.start = function(settings, callback) {
    if (settings) {
      this.settings.server = settings;
    }
    if (typeof(callback) == 'function') {
      // Remove all `request` handlers registered prior to this
      this.removeAllListeners('request')
      this.on('request', callback);
    }
    this.server = server.start(this.settings.server, this.bind(function(conn) {
      var urlData = url.parse(conn.req.url, true);
      var args = path.args(urlData.query);
      this.emit('request', urlData.pathname, args, conn);
    }));
    this.emit('start');
  };
  /**
   * `init` event handler.
   *
   * Emitted after `mode.init` has been called.
   *
   * @see mode.init
   */
  this.on('init', function() {
    this.throw = error.throw;
    this.route = route;
    path.controller = this.controller;
  });
  /**
   * `setup` event handler.
   *
   * Emitted after `mode.setup` has been called and an app
   * folder has been indexed.
   *
   * @see mode.setup
   */
  this.on('setup', function() {
    mustache.init(this.helper);
    if (this.settings.types) {
      extension.types = this.settings.types;
    }
  });
  /**
   * `start` event handler.
   *
   * Emitted after `mode.start` has been called and the server
   * is booting.
   *
   * TODO: There should be a pre-server hook mechanism that
   * allows other external services (such as a database) to
   * subscribe and then waits for all of them to initialize
   * successfully before turning on the web server.
   *
   * @see mode.start
   */
  this.on('start', function() {
    if (this.settings.db) {
      model.init(this.settings.db, this.bind(function() {
        console.log('Database initialized.');
      }));
    }
  });
  /**
   * `request` event handler.
   *
   * This will be removed if a custom request handler has been
   * set at `mode.start`, otherwise the _path_ module will
   * attempt to load a matching route and controller action.
   *
   * In the case of the latter, each request is wrapper around
   * a new domain that handles its exceptions separately.
   *
   * @see mode.start
   * @see path.load
   */
  this.on('request', function(query, args, conn) {
    console.log('Loading path: ' + query);
    cookie.init(conn.req, conn.res);
    session.init(conn.req);
    new path.Path(query, conn).load(args, function(output) {
      conn.close(output);
    });
  });
});
// Instantiate and export main class
module.exports = new Mode();