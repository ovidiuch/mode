var error = require('../error.js'),
    mustache = require('../mustache.js'),
    path = require('../path.js'),
    view = require('../view.js');
/**
 * @class Base controller
 */
module.exports = require('../class/base.js').extend(function(parent) {
  /**
   * Action method namespace.
   *
   * @type {object}
   */
  this.action = {};
  /**
   * View layout.
   *
   * Can be changed at any time before an action method
   * responds. Normally its value depends on the path extension.
   *
   * The _layout_ folder is a _view_ sub-folder. So a valid
   * file path for the `default` layout would look like this:
   *
   *     {{viewPath}}/layout/default.mustache
   *
   * @type {string}
   */
  this.layout = 'default';
  /**
   * Redirect to url.
   *
   * Only available for HTTP request-driven controllers, and
   * should only be called from inside a current controller.
   *
   * The query is mustache-parsed for variables, using the
   * current controller args.
   *
   * Example:
   *
   *     // Internal url
   *     this.redirect('/{{controller}}/new');
   *     // External url
   *     this.redirect('http://google.com', {q: 'mode.js'});
   *
   * @param {string} query
   * @param {object} args
   * @throws {Error} When server request is missing
   * @see path.redirect
   */
  this.redirect = function(query, args) {
    if (!this.conn) {
      error.throw(400, 'No server request to redirect');
    }
    query = mustache.parse(query, this.args);
    path.redirect(query, args, this.conn);
  };
  /**
   * Load controller action.
   *
   * The path query can be both internal and external. An
   * internal path consists of a single action name (that the
   * current controller should have defined). An external path
   * consists of a query containing more than one key (separated
   * by a _slash_), that will be handled by a new `path.load`
   * call, separately, passing on the same callback the current
   * controller received initially.
   *
   * If ran from inside an already-running controller, the query
   * is mustache-parsed for variables, using the current args.
   *
   * The second parameter initiates the args property, which,
   * after getting more values assigned from the controller
   * action along the way, eventually ends up as the view vars.
   *
   * TODO: Add namespace awareness.
   *
   * Example:
   *
   *     // Change action from inside controller
   *     this.load('index');
   *     // Load external path from inside controller
   *     this.load('/categoy/new');
   *
   *     // Render a controller action manually
   *     var controller = new mode.controller.User();
   *     // Load "new" action with no arguments
   *     controller.load('new', {}, function(output) {
   *       // Print rendered view
   *       console.log(output);
   *     });
   *
   * All string responses are also ran through a mustache
   * parser, along with the current controller args.
   *
   * Example:
   *
   *     // Load the index view of the current controller
   *     return '/{{controller}}/index';
   *
   * @param {string} query
   * @param {object} args
   * @param {function} callback
   * @throws {Error} If requested method is invalid
   * @see path.load
   * @see #call
   */
  this.load = function(query, args, callback) {
    // If controller has args at this point, we assume it was
    // already loaded before
    if (this.args) {
      // Parse query for variables, using the current args
      query = mustache.parse(query, this.args);
    }
    // Use the current callback if a new one isn't specified
    if (!callback) {
      // This still doesn't assure a valid callback, but works
      // in the case of internal redirections
      callback = this.callback;
    }
    // If the path query has more than two keys, it is clearly
    // an external path, so a new path needs to be loaded
    if (path.keys(query).length > 1) {
      new path.Path(query).load(args, callback);
      return;
    }
    // At this point we assume it's an internal path, so we
    // fetch the action name from the query, while making sure
    // any preceding slash is removed
    var action = path.keys(query).pop();
    // Check if action method exists and throw otherwise
    var method = this.action[action];
    if (typeof(method) != 'function') {
      error.throw(400, 'Invalid controller action ' + action);
    }
    this.args = args || {};
    // Pin callback for later passing-on, in case the controller
    // gets redirected in mid-use
    this.callback = callback;
    // Call `init` method first, and the actual action after its
    // response. No need to bind the callback, since it will be
    // bound to an event that belongs to this object as well
    this.call('init', function() {
      // Call requested action
      this.call(method, function(response) {
        // Ignore response if there's no callback set
        if (typeof(callback) != 'function') {
          return;
        }
        // Parse response for vars, using the current args, if
        // the response is a string
        if (typeof(response) == 'string') {
          response = mustache.parse(response, this.args);
        }
        // Return direct response if the controller doesn't have
        // an indexed path attached to it and thus can't search
        // for a corresponding view to load
        if (!this.static.path) {
          callback(response);
        } else {
          // Call main callback with the rendered view output as
          // its first and only parameter
          callback(this.render(action, response));
        }
      });
    });
  };
  /**
   * Render action view.
   *
   * After an action runs it course, a corresponding view file
   * for that controller/action is looked for, to be open. But
   * an action can also return a custom string to output, or
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
   * @param {string} action
   * @param {*} response Returned action response
   * @return {*} Rendered output
   * @throws {Error} If a view path can't be loaded
   */
  this.render = function(action, response) {
    // Build default, implicit view path and init empty output
    var path = this.static.path + '/' + action, output;
    // If response is not empty (as opposed to a null, implicit,
    // or even explicit, return)
    if (response != null) {
      // Return unaltered response if not string
      if (typeof(response) != 'string') {
        return response;
      }
      // Override the implicit view path with the response
      // itself, if it turns out to be a actual view path;
      // otherwise just set it as the entire output
      if (view.exists(response)) {
        path = response;
      } else {
        output = response;
      }
    }
    // Try to render the view path if an ouput has not already
    // been established by now
    if (output == null) {
      // Render view with controller args
      output = view.render(path, this.args);
      // Throw if view path was invalid
      if (typeof(output) != 'string') {
        error.throw(404, 'Invalid view ' + path);
      }
    }
    // Attempt to render view layout, if specified
    if (this.layout) {
      this.args.content = output;
      // Render view layout with controller args and initial
      // view output as "content"
      output = view.render('/layout/' + this.layout, this.args);
      // Throw if layout path was invalid
      if (typeof(output) != 'string') {
        error.throw(404, 'Invalid layout ' + path);
      }
    }
    return output;
  };
  /**
   * Asynchronous method call.
   *
   * This method is used to allow a method to respond in both
   * sync and async ways. A one-time handler is registered that
   * can be emitted from a callback later on, but that also gets
   * triggered immediately with the conventional function return
   * value (sync) if no callback has been bound for the run-time
   * duration of the method.
   *
   * This works in conjunction with the _return_ method, that
   * manually triggers the `return` event.
   *
   * The method can be both a string or the actual function
   * reference. Strings are path-parsed, starting with the
   * controller instance.
   *
   * Warning: Only one method can be called at a time, in order
   * for callbacks not to mix up between them.
   *
   * TODO: Integrate in base class?
   *
   * Example:
   *
   *     // Call different method from inside controller
   *     this.call('action/edit', function(response) {
   *       // Print method returned value
   *       console.log(response);
   *     })
   *
   * @param {string|function} method Method name
   * @param {function} callback Response callback
   * @see class.Base#bind
   * @see path.parse
   * @see #return
   */
  this.call = function(method, callback) {
    // Remove all previous `return` listeners
    this.removeAllListeners('return');
    // Assign a one-time handler for catching returned values
    this.once('return', callback);
    // Parse method name and fetch the method reference, if not
    // already a function object
    if (typeof(method) != 'function') {
      method = path.parse(method, this);
    }
    // Catch action method return value in case the
    // response was returned synchronously
    var response = method.call(this);
    // If there's no callback bound to the controller instance
    // then we hang on to the returned value
    if (!this.bound) {
      // It won't matter if the return event has been emitted
      // already because its handler was set to expire after the
      // first time
      this.emit('return', response);
    }
  };
  /**
   * Asynchronous method return.
   *
   * This works in conjunction with the _call_ method, and is
   * used to end a controller method asynchronously, from within
   * a bound callback.
   *
   * Example:
   *
   *    // Synchronous, implicit return
   *    return '/user/index';
   *    // Asynchronous, explicit return
   *    this.return('/user/index');
   *
   * @param {*} response Returned value
   * @see class.Base#bind
   * @see #call
   */
  this.return = function(response) {
    this.emit('return', response);
  };
  /**
   * Controller init.
   *
   * Should run before any action method.
   */
  this.init = function() {};
}, true);