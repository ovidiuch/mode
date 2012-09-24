var path = require('./path.js');
/**
 * Throw exception.
 *
 * Uses the same params as `create` does, except the exception
 * is also automatically thrown.
 *
 * Example:
 *
 *     error.throw(404, 'Page not found');
 *
 * @param {number} code
 * @param {string} message
 * @param {object} args Extra properties
 * @see #create
 * @see #handle
 */
exports.throw = function(code, message, args) {
  throw exports.create(code, message, args);
};
/**
 * Create exception object.
 *
 * A wrapper for throwing exceptions with additional properties
 * attached to them.
 *
 * Only the code and the message parameteres are required.
 *
 * Example:
 *
 *     throw error.create(500, 'Something went wrong');
 *
 * @param {number} code
 * @param {string} message
 * @param {object} args Extra properties
 * @return {Error}
 */
exports.create = function(code, message, args) {
  var error = new Error(message);
  error.code = code;
  error.args = args;
  return error;
};
/**
 * Handle exceptions.
 *
 * Read received error object and attempt to load the _error_
 * controller with the error's properties.
 *
 * This works for both user-defined and internal errors, the
 * code property defaulting to 500 when missing.
 *
 * The server connection is optional, but providing one will
 * set a proper status code to it and reset its (maybe)
 * previously set `Content-Type` header.
 *
 * TODO: Catch circular exceptions.
 *
 * Example:
 *
 *     domain.on('error', function(error) {
 *       error.handle(error, conn);
 *     });
 *
 * @param {Error} error
 * @param {server.Connection} conn Server connection
 * @see server.Connection
 */
exports.handle = function(error, callback, conn) {
  console.log('Exception:', error);
  var args = error.args || {};
  args.code = error.code || 500;
  args.message = error.message;
  // Set status code and reset the content type header of the
  // server response, if a server connection is present
  if (conn) {
    conn.res.statusCode = args.code;
    conn.res.removeHeader('Content-Type');
  }
  new path.Path('/error/show').load(args, callback);
};