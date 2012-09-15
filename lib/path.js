var error = require('./error.js'),
    extension = require('./extension.js'),
    mustache = require('./mustache.js'),
    route = require('./route.js'),
    string = require('./string.js'),
    view = require('./view.js');
/**
 * Load internal path query.
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
 *     path.load('/comment/new');
 *
 * @param {string} query
 * @param {object} args
 * @param {mode.server.Connection} conn Server connnection
 * @see Path
 * @see Path.load
 * @see mode.server.Connection
 */
exports.load = function(query, args, conn) {
  new Path(query, conn.req.method).load(args, conn);
};
/**
 * Redirect browser to path query.
 *
 * Besides the path string and a set of arguments (that will
 * become the `GET` request arguments), a server connection
 * is also required for this call.
 *
 * Example:
 *
 *     // Internal path
 *     path.redirect('/post/new');
 *     // External path
 *     path.redirect('http://google.com');
 *
 * @param {string} query
 * @param {object} args
 * @param {mode.server.Connection} conn Server connection
 * @see mode.server.Connection
 */
exports.redirect = function(query, args, conn) {
  console.log('Redirecting to: ' + query);
  var headers = conn.req.headers;
  if (!query.match(/^[a-z0-9]+:/)) {
    query = headers.protocol + '//' + headers.host + query;
  }
  if (args = require('querystring').stringify(args)) {
    query += '?' + args;
  }
  conn.redirect(query);
};
/**
 * Fetch or insert object at path query.
 *
 * Example:
 *
 *     // Fetch mode.controller.FooBar
 *     path.parse('/controller/foo-bar', mode);
 *     path.parse('/foo-bar', mode.controller);
 *     // Insert class at mode.controller.FooBar
 *     path.parse('/controller/foo-bar', mode, FooBar);
 *     path.parse('/foo-bar', mode.controller, FooBar);
 *
 * @param {string} query
 * @param {object} scope Parent scope
 * @param {object} insert Object to insert
 * @return {object} Object at path
 */
exports.parse = function(query, scope, insert) {
  // Return false directly is the parent scope is missing
  if (!scope) {
    return false;
  }
  // Split query by slashes, into keys
  var keys = exports.keys(query), key, rKey, cKey;
  // Consume all keys
  while (key = keys.shift()) {
    // Create regular and capitalized key variants
    rKey = string.toCamelCase(key, false);
    cKey = string.toCamelCase(key, true);
    // Check existance of both keys sequentially,
    // defaulting to the regular one
    if (!scope[key = cKey] && !scope[key = rKey]) {
      // Return false if none of the key variants exist and not
      // inserting object, otherwise create an empty one, but
      // only if this is not the last iteration
      if (!insert) {
        return false;
      } else if (keys.length) {
        scope[key] = {};
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
 * Split path query into keys.
 *
 * Example:
 *
 *     path.keys('/one/two/three');
 *     // returns ['one', 'two', 'three']
 *
 * @param {string} query
 * @return {Array} Array of keys
 */
exports.keys = function(query) {
  return query.match(/[^/]+/g);
};
/**
 * Process hierarchical keys into nested objects.
 *
 * Example:
 *
 *     path.args({'user.id': 34});
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
 * TODO: Extend base class
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
    if (!(this.args = route.match(this.query, this.method))) {
      return 'Invalid request ' + this.query;
    }
    this.type = extension.type(
      this.extension = extension.extract(this.query)
    );
    if (!this.type) {
      return 'Invalid extension ' + this.extension;
    }
    this.controller = exports.parse(
      this.args.controller, exports.controller
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
      error.throw(404, this.error);
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
      output = mustache.parse(output, this.args);
    }
    var path;
    // Default response, try to find corresponding view
    if (!output && typeof(output) != 'string') {
      path = '/' + this.args.controller + '/' + this.args.action;
    }
    // Check if response is an actual view path
    if (typeof(output) == 'string' && view.exists(output)) {
      path = output;
    }
    // Attempt to render view when a path for it was found
    if (path && typeof(output = view.render(path, this.args)) != 'string') {
      error.throw(404, 'Invalid view ' + path);
    }
    // Attempt to render view layout if specified
    if (typeof(output) == 'string' && this.args.layout) {
      this.args.content = output;
      path = '/layout/' + this.args.layout;
      if (typeof(output = view.render(path, this.args)) != 'string') {
        error.throw(404, 'Invalid layout ' + path);
      }
    }
    // Send output to user and close connection
    this.conn.close(output, this.args.code, {
      'Content-Type': this.type
    });
  }
};
/**
 * Controller pool.
 *
 * Must be populated at run-time in order for the path module
 * to recognize corresponding routes.
 *
 * @type {object}
 */
exports.controller = {};