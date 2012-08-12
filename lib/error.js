var mode = require('./mode.js');
/**
 * Throw exception.
 *
 * A wrapper for throwing exceptions with additional properties
 * attached to them.
 *
 * Only the code and the message parameteres are required.
 * 
 * Example:
 *
 *     mode.throw(404, 'Page not found');
 * 
 * @param {number} code
 * @param {string} message
 * @param {object} args Extra properties
 * @see #handle
 */
mode.throw = exports.throw = function(code, message, args) {
  var error = new Error(message);
  error.code = code;
  error.args = args;
  throw error;
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
 * Besides the error object, a server connection instance is
 * also required for this to work.
 * 
 * Example:
 *
 *     domain.on('error', function (error) {
 *       mode.error.handle(error, conn);
 *     });
 * 
 * @param {Error} error
 * @param {mode.server.Connection} conn Server connection
 * @see mode.server.Connection
 */
exports.handle = function(error, conn) {
  console.log('Exception:', error);
  var args = error.args || {};
  args.code = error.code || 500;
  args.message = error.message;
  try {
    mode.path.load('/error/show', args, conn);
  } catch (error) {
    console.log('Circular exception:', error);
    conn.close('Error', 500);
  }
};