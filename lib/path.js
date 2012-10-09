var domain = require('domain'),
    querystring = require('querystring'),
    url = require('url'),
    error = require('./error.js'),
    extension = require('./extension.js'),
    mustache = require('./mustache.js'),
    route = require('./route.js'),
    session = require('./session.js'),
    string = require('./string.js'),
    view = require('./view.js');
/**
 * Redirect browser to path query.
 *
 * Besides the path query and an optional set of arguments
 * (that will become the `GET` request arguments), an active
 * server connection is also required for this call.
 *
 * The query can be both an internal path (in which case the
 * current protocol and host name will be prepended to it) or
 * an external url. Either way, the browser will be redirected
 * to a new page.
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
 * @param {server.Connection} conn Server connection
 * @see server.Connection
 */
exports.redirect = function(query, args, conn) {
  console.log('Redirecting to: ' + query);
  var headers = conn.req.headers;
  // Prepend current protocol and host name if query appears
  // to be internal
  if (!query.match(/^[a-z0-9]+:/)) {
    query = headers.protocol + '//' + headers.host + query;
  }
  // Append any received args to the url as GET params
  if (args = querystring.stringify(args)) {
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
 * @class Path
 */
exports.Path = require('./class/base.js').extend(function() {
  /*
   * Path constructor.
   *
   * The path query itself can contain query string args that
   * will be stripped away from it, processed and poured into
   * the path args.
   *
   * An extension will also be automatically detected from the
   * path query.
   *
   * A server connection is optional, but when one is present,
   * the request method (that will also be used for route
   * matching) and the POST data object get pre-populated.
   *
   * Server connections will also be passed on to controller
   * instances created at `load`.
   *
   * Examples:
   *
   *     // Request-driven path
   *     mode.on('request', function(query, args, conn) {
   *       new Path(query, conn).load(args, function(output) {
   *         conn.close(output);
   *       });
   *     });
   *
   *     // Custom path
   *     new Path('/user/show').load({id: 344}, function(output) {
   *       console.log(output);
   *     });
   *
   *     // Custom path with POST data and query string args
   *     var p = new Path('/user/update?id=344');
   *     p.method = 'POST';
   *     p.data = {
   *       name: 'John',
   *       age: 34
   *     };
   *     p.load();
   *
   * @constructor
   * @param {string} query
   * @param {server.Connection} conn Server connnection
   * @see #args
   * @see server.Connection
   */
  this.instance = function(query, conn) {
    // Extract pathname and query string from path query
    var parts = url.parse(query, true);
    this.query = parts.pathname;
    this.args = exports.args(parts.query);
    // Extract extension up front, it order to make sure that it
    // will be passed on in case of a path redirection (even on
    // validation errors)
    this.extension = extension.extract(query);
    // Pre-populate method, POST data and the session object
    // when a server connection is present
    if (this.conn = conn) {
      this.method = conn.req.method;
      this.data = conn.data;
      this.session = session.getByCookie(conn.cookie);
    }
  };
  /**
   * Update path args.
   *
   * Extends the current set of args by applying a new one on
   * top of it.
   *
   * @param {object} args New set of args
   */
  this.update = function(args) {
    for (var i in args) {
      this.args[i] = args[i];
    }
  };
  /**
   * Validate path.
   *
   * After and if a route has matched the given query, its
   * corresponding extension, controller and action are then
   * validated.
   *
   * If all of these match, the `Path` instance will be error-free.
   *
   * @return {string} Path error
   * @see route
   */
  this.validate = function() {
    // Attempt to match a route and extend current args with
    // returned match vars
    var args = route.match(this.query, this.method);
    if (!args) {
      return 'Invalid request ' + this.query;
    }
    this.update(args);
    // Get and validate content-type by extension
    this.type = extension.type(this.extension);
    if (!this.type) {
      return 'Invalid extension ' + this.extension;
    }
    this.controller = exports.parse(this.args.controller, exports.controller);
    if (!this.controller || this.controller.abstract) {
      return 'Invalid controller ' + this.args.controller;
    }
    // TODO: Add controller method for checking actions
    if (typeof(this.controller.prototype.action[this.args.action]) != 'function') {
      return 'Invalid action ' + this.args.action;
    }
    return null;
  };
  /**
   * Load path.
   *
   * If it doesn't have any validation error to throw, it
   * instantiates and loads controller asynchronously.
   *
   * Each path has a unique domain for handling errors that
   * occur under the _thread_ they initiated.
   *
   * The appointed callback will be passed on to the loaded
   * controller and will follow through (possibly through
   * several paths, in the case of internal redirections) until
   * an end ouput has been established.
   *
   * @param {object} args
   * @param {function} callback
   * @see controller.Base#load
   * @see error.handle
   */
  this.load = function(args, callback) {
    // Create an empty callback if missing, in order to avoid
    // the need for excessive checks when working around it
    if (!callback) {
      callback = function(){};
    }
    var d = domain.create();
    d.on('error', this.bind(function(err) {
      // Make sure current extension is passed on to the new
      // error path
      var query = extension.change('/error/show', this.extension);
      // Process error into path args
      var args = error.process(err, this.conn);
      // A server connection (this.conn) might be missing at
      // this point, but its value must be transparently passed
      // on to the error path
      new exports.Path(query, this.conn).load(args, callback);
    }));
    // Add current Path instance to its own newly-setup domain
    d.add(this);
    var err = this.validate();
    if (err) {
      // Instead of throwing the detected path error, create
      // it and emit it under the current Path instance (which
      // is an EventEmitter because it extends the base class).
      // This way it gets caught by the path's domain and gets
      // handled correctly
      this.emit('error', error.create(404, err));
      // We still need to end execution because it didn't stop
      // implicitly as it would when throwing errors normally
      return;
    }
    // Extend current args with user-defined ones
    this.update(args);
    // Set the Content-Type response header if there's a server
    // connection involved. This header will be removed if a
    // error occurs under this path's domain and the callback is
    // thus passed on to be handled by the error module
    if (this.conn) {
      this.conn.res.setHeader('Content-Type', this.type);
    }
    console.log('Loading controller: ' + this.args.controller);
    // Send current path instance to new controller instance
    var controller = new this.controller(this);
    console.log('Loading action: ' + this.args.action);
    controller.load(this.args.action, this.args, callback);
  };
});
/**
 * Controller pool.
 *
 * Must be populated at run-time in order for the path module
 * to recognize corresponding routes.
 *
 * @type {object}
 */
exports.controller = {};