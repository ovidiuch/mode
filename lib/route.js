var mustache = require('./mustache.js');
/**
 * Register route.
 *
 * The pattern can be both a string or a plain RegExp. Strings
 * are parsed of _keywords_ (check below) and then turned into
 * regualar expressions as well.
 *
 * The arguments object is used to map RegExp matches to
 * specific keys that end up being replaced upon matching, and
 * then sent to the controller, once the route is validated.
 *
 * Example:
 *
 *     // Controller/action route
 *     route.add('/:controller/@action');
 *     // Same route, in RegExp
 *     route.add(/^\/([a-z0-9-/]+)\/([a-z0-9-]+)$/, {
 *       controller: '$1', action: '$2'
 *     });
 *
 * Besides the custom variables that the arguments object can
 * host, a `redirect` path can also be specified. It can contain
 * mustache-like variables that will be replaced with matching
 * values from the processed arguments.
 *
 * Redirect example:
 *
 *     // Default action route
 *     route.add('/@controller/?', {redirect: '/{{controller}}/index'});
 *
 * A callback function can also be specified, in order to
 * extend the validation process.
 *
 * Furthermore, the callback function receives the processed
 * arguments as the first parameter, but also the server request
 * method as the second, which can also be used for validation.
 *
 * Callback example:
 *
 *     // REST route
 *     route.add('/:controller/@action', {}, function(args, method) {
 *       var actions = [
 *         'index', 'show', 'new', 'edit', 'create', 'update', 'delete'
 *       ];
 *       if (actions.indexOf(args.action) == -1) {
 *         return false;
 *       }
 *       // POST is required for create, update and delete
 *       return method == 'POST' || actions.indexOf(args.action) < 4;
 *     });
 *
 * String patterns can only match queries entirely, from
 * beginning to end. RegExp patterns, however, can also be
 * used to match specific query parts only.
 *
 * RegExp example:
 *
 *     // Route for mapping anything that starts with '/user-'
 *     route.add(/^\/user-/, {controller: 'user', action: 'index'});
 *
 * @param {string|RegExp} pattern
 * @param {object} args
 * @param {function} callback
 * @see #process
 * @see #keywords
 */
exports.add = function(pattern, args, callback) {
  if (!(pattern instanceof RegExp)) {
    pattern = process(pattern, args);
  }
  list.push({
    pattern: pattern, args: args, callback: callback
  });
};
/**
 * Match query.
 *
 * The request method is required because a route's callback
 * might use it for validation.
 *
 * The returned match variables are the arguments the route
 * had received or generated (in the case of string-processed
 * patterns) upon adding, populated with query matches, in the
 * case of keys that map RegExp match variables.
 *
 * Example:
 *
 *     // Considering the route.add examples
 *     route.match('/post');
 *     // returns {controller: 'post', action: 'index'}
 *     route.match('/post/create', 'POST');
 *     // returns {controller: 'post', action: 'create'}
 *     route.match('/post/delete');
 *     // return false (because request is not POST)
 *
 * @param {string} query Path query
 * @param {string} method Request method
 * @return {object} Match variables
 */
exports.match = function(query, method) {
  var vars, args;
  for (var i in list) {
    if (!(vars = query.match(list[i].pattern))) {
      continue;
    }
    args = {};
    for (var j in list[i].args) {
      args[j] = list[i].args[j].replace(/\$([0-9]+)/, function() {
        return vars[arguments[1]];
      });
    }
    if (list[i].args.redirect) {
      return this.match(mustache.parse(list[i].args.redirect, args));
    }
    if (list[i].callback && !list[i].callback(args, method)) {
      continue;
    }
    return args;
  }
  return false;
};
/**
 * Keywords list.
 *
 * Supported types:
 *
 *   - :keyword - alphanumeric, hypens and slashes
 *   - @keyword - alphanumeric and hypens
 *   - #keyword - digits only
 *
 * The name of the keyword will become a key with its matching
 * value within the match variables.
 *
 * @type {object}
 * @private
 */
var keywords = {
  ':': '[a-z0-9-/]+',
  '@': '[a-z0-9-]+',
  '#': '[0-9]+'
};
/**
 * List of all registered routes.
 *
 * @type {Array}
 * @private
 */
var list = [];
/**
 * Process pattern.
 *
 * Replace keywords from pattern with their corresponding
 * expressions, and map them with their variable index inside
 * the arguments object.
 *
 * @param {string} pattern
 * @param {object} args
 * @return {RegExp} Generated regular expression
 * @private
 */
var process = function(pattern, args) {
  // Escape dots from pattern string
  pattern = pattern.replace(/(\.)/g, '\\$1');
  var count = 0;
  var body = pattern.replace(/(:|@|#)([a-z]+)/ig, function(match, type, name) {
    args[name] = '$' + ++count;
    return '(' + keywords[type] + ')';
  });
  return new RegExp('^' + body + '$', 'i')
};