/**
 * Supported url extensions, with corresponding mime-types.
 *
 * This object should be extended or overriden at run-time in
 * order to support additional extensions.
 *
 * Example:
 *
 *     extension.types = {
 *         default: 'text/html',
 *         css: 'text/css',
 *         js: 'application/javascript'
 *     };
 *
 * @type {object}
 */
exports.types = {
  default: 'text/html'
};
/**
 * Get mime-type for specific extension.
 *
 * Searches for a matching mime-type within the `types`
 * dictionary. Name parameter defaults to `default` when
 * omitted and returning value defaults to `text/plain` when
 * the dictionary is missing or is not an object.
 *
 * Example:
 *
 *     // Using the previous 'types' example
 *     extension.type('css'); // returns 'text/css'
 *     extension.type(); // returns 'text/html'
 *
 * @param {string} name
 * @return {string} Corresponding mime-type
 * @see #types
 */
exports.type = function(name) {
  if (typeof(this.types) != 'object') {
    return 'text/plain';
  }
  return this.types[name || 'default'];
};
/**
 * Extract extension from path.
 *
 * Returns an empty string when no extension is found.
 *
 * @param {string} path
 * @return {string} Identified extension
 */
exports.extract = function(path) {
  var match = path.match(PATTERN);
  return match ? match[1] : '';
};
/**
 * Strip extension from path.
 *
 * Path stays intact if no extension is found.
 *
 * @param {string} path
 * @return {strip} Stripped path
 */
exports.strip = function(path) {
  return path.replace(PATTERN, '$2');
};
/**
 * Extension-matching pattern.
 *
 * @type {RegExp}
 * @const
 * @private
 */
var PATTERN = /\.([a-z0-9-]*?)([?#].*)?$/i;