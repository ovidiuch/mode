var mode = require('./mode.js'), string = require('./string.js');
/**
 * Load internal path.
 *
 * Change controller/action without affecting the browser url.
 *
 * Can be called at any time and as many times as needed, as
 * long as output has not yet been sent to the user.
 *
 * Besides the path string and a set of arguments (that will
 * become the _args_ property of the controller), a server
 * connection is also required for this call.
 *
 * Example:
 *
 *     // Load _new_ action of _comment_ controller
 *     mode.path.load('/comment/new');
 *
 * @param {string} path
 * @param {object} args
 * @param {mode.server.Connection} conn Server connnection
 * @see Path
 * @see Path.load
 * @see mode.server.Connection
 */
exports.load = function(path, args, conn) {
  new Path(path, conn.req.method).load(args, conn);
};
/**
 * Redirect browser to path.
 *
 * Besides the path string and a set of arguments (that will
 * become the `GET` request arguments), a server connection
 * is also required for this call.
 *
 * Example:
 *
 *     // Internal path
 *     mode.path.redirect('/post/new');
 *     // External path
 *     mode.path.redirect('http://google.com');
 *
 * @param {string} path
 * @param {object} args
 * @param {mode.server.Connection} conn Server connection
 * @see mode.server.Connection
 */
exports.redirect = function(path, args, conn) {
  console.log('Redirecting to: ' + path);
  var headers = conn.req.headers;
  if (!path.match(/^[a-z0-9]+:/)) {
    path = headers.protocol + '//' + headers.host + path;
  }
  if (args = require('querystring').stringify(args)) {
    path += '?' + args;
  }
  conn.redirect(path);
};
/**
 * Fetch or insert object at path.
 *
 * Example:
 *
 *     // Fetch mode.controller.FooBar
 *     mode.path.parse('/controller/foo-bar');
 *     mode.path.parse('/foo-bar', null, mode.controller);
 *     // Insert class at mode.controller.FooBar
 *     mode.path.parse('/controller/foo-bar', FooBar);
 *     mode.path.parse('/foo-bar', FooBar, mode.controller);
 *
 * @param {string} path
 * @param {object} insert Object to insert
 * @param {object} scope Parent scope
 * @return {object} Object at path
 */
exports.parse = function(path, insert, scope) {
  // Use mode as the parent object when no scope is specified
  if (!scope) {
    scope = mode;
  }
  // Split path by slashes, into keys
  var keys = exports.keys(path), key, rKey, cKey;
  // Consume all keys
  while (key = keys.shift()) {
    // Create regular and capitalized key variants
    rKey = string.toCamelCase(key, false);
    cKey = string.toCamelCase(key, true);
    // Check existance of both keys sequentially,
    // defaulting to the regular one
    if (!scope[key = cKey] && !scope[key = rKey]) {
      // When none of the key variants exist, create an empty
      // object for the regular one if inserting object, or
      // return false otherwise
      if (insert) {
        scope[key] = {};
      } else {
        return false;
      }
    }
    // If inserting object, assign it when the loop reaches
    // the last path key
    if (insert && !keys.length) {
      // Make sure key is capitalized when inserting a class
      if (typeof(insert.extend) == 'function') {
        key = cKey;
      }
      scope[key] = insert;
    }
    // Advance through the object chain
    scope = scope[key];
  }
  // After iterating through all the path keys, the scope
  // variable should become the searched or inserted object
  return scope;
};
/**
 * Split path into keys.
 *
 * Example:
 *
 *     mode.path.keys('/one/two/three');
 *     // returns ['one', 'two', 'three']
 *
 * @param {string} path
 * @return {Array} Array of keys
 */
exports.keys = function(path) {
  return path.match(/[^/]+/g);
};
/**
 * Process hierarchical keys into nested objects.
 *
 * Example:
 *
 *     mode.path.args({'user.id': 34});
 *     // returns {user: {id: 34}}
 *
 * @param {object} map
 * @return {object} Processed arguments
 */
exports.args = function(map) {
  var data = {}, child, keys, k;
  for(var key in map) {
    if (key.indexOf('.') == -1) {
      data[key] = map[key];
      continue;
    }
    keys = key.split('.');
    while (keys.length > 1) {
      if (!data[k = keys.shift()]) {
        data[k] = {};
      }
      child = data[k];
    }
    child[keys.pop()] = map[key];
  }
  return data;
};
/**
 * Path wrapper.
 *
 * Request method defaults to `GET` when missing.
 *
 * TODO: Receive entire connection request instead of only
 * its method.
 *
 * @constructor
 * @param {string} query
 * @param {string} method Request method
 * @private
 */
var Path = function(query, method) {
  this.method = method || 'GET';
  this.error = this.init(this.query = query);
};
Path.prototype = {
  /**
   * Init and validate path query.
   *
   * After and if a route has matched the given query, its
   * corresponding extension, controller and action are checked
   * for existence.
   *
   * If all these match, the `Path` will be error-free.
   *
   * @return {string} Matching error
   * @see mode.route
   */
  init: function() {
    // Init internal arguments from route matches
    if (!(this.args = mode.route.match(this.query, this.method))) {
      return 'Invalid request ' + this.query;
    }
    this.type = mode.extension.type(
      this.extension = mode.extension.extract(this.query)
    );
    if (!this.type) {
      return 'Invalid extension ' + this.extension;
    }
    this.controller = mode.path.parse(
      this.args.controller, null, mode.controller
    );
    if (!this.controller || this.controller.abstract) {
      return 'Invalid controller ' + this.args.controller;
    }
    if (typeof(this.controller.prototype[this.args.action]) != 'function') {
      return 'Invalid action ' + this.args.action;
    }
    return null;
  },
  /**
   * Load internal path query.
   *
   * Throw error if there's any, otherwise instantiate and
   * init controller asynchronously.
   *
   * The controller action will be loaded after the init method
   * fires its callback, or directly if there's no init method
   * to call in the first place.
   *
   * @param {object} args
   * @param {mode.server.Connection} conn Server connnection
   * @see mode.server.Connection
   */
  load: function(args, conn) {
    if (this.error) {
      mode.throw(404, this.error);
    }
    // Extend internal arguments with user-defined ones
    for (var i in args) {
      if (!this.args[i]) {
        this.args[i] = args[i];
      }
    }
    console.log('Loading controller: ' + this.args.controller);
    this.controller = new this.controller(this.args, this.conn = conn);
    var that = this, callback = false;
    this.controller.callback = function() {
      callback = true;
      that.action();
    };
    if (typeof(this.controller.init) == 'function') {
      this.controller.init();
    }
    if (!this.controller.bound && !callback) {
      this.controller.callback();
    }
  },
  /**
   * Load controller action.
   *
   * An action can end its activity both synchronously and
   * asynchronously.
   *
   * Example:
   *
   *     // End action synchronously
   *     return;
   *     // End action asynchronously
   *     this.callback();
   */
  action: function() {
    console.log('Loading action: ' + this.args.action);
    var that = this, callback = false;
    this.controller.callback = function(response) {
      callback = true;
      that.view(response);
    };
    var response = this.controller[this.args.action]();
    if (!this.controller.bound && !callback) {
      this.controller.callback(response);
    }
  },
  /**
   * Load controller view.
   *
   * After an action runs it course, a corresponding view file
   * for that controller/action is looked for, to be open. But
   * an action call also return a custom string to output, or
   * a specific path to load a different view file.
   *
   * Example:
   *
   *     // End action normally
   *     return;
   *     // End action with custom output
   *     return 'Hello World!';
   *     // End action with different view
   *     return '/user/new';
   *
   * The custom output returned is also ran through a mustache
   * parser, along with all the controller args.
   *
   * Example:
   *
   *     // Load the index view of the current controller
   *     return '/{{controller}}/index';
   *
   * @param {*} output Returned value of controller action
   */
  view: function(output) {
    // Parse returned for vars if string
    if (typeof(output) == 'string') {
      output = mode.mustache.parse(output, this.args);
    }
    var path;
    // Default response, try to find corresponding view
    if (!output && typeof(output) != 'string') {
      path = '/' + this.args.controller + '/' + this.args.action;
    }
    // Check if response is an actual view path
    if (typeof(output) == 'string' && mode.view.exists(output)) {
      path = output;
    }
    // Attempt to render view when a path for it was found
    if (path && typeof(output = mode.view.render(path, this.args)) != 'string') {
      mode.throw(404, 'Invalid view ' + path);
    }
    // Attempt to render view layout if specified
    if (typeof(output) == 'string' && this.args.layout) {
      this.args.content = output;
      path = '/layout/' + this.args.layout;
      if (typeof(output = mode.view.render(path, this.args)) != 'string') {
        mode.throw(404, 'Invalid layout ' + path);
      }
    }
    // Send output to user and close connection
    this.conn.close(output, this.args.code, {
      'Content-Type': this.type
    });
  }
};