var mode = require('./mode.js');
/**
 * Get mime-type for specific extension.
 *
 * Searches for a matching mime-type within the mode.settings.types
 * dictionary. Name parameter defaults to 'default' when omitted
 * and returning value defaults to 'text/plain' when the dictionary
 * is missing or not an object.
 *
 * Example:
 *
 *     mode.settings.types = {
 *         default: 'text/html',
 *         css: 'text/css',
 *         js: 'application/javascript'
 *     };
 *     mode.extension.type('css'); // returns 'text/css'
 *     mode.extension.type(); // returns 'html/html'
 *
 * @param {string} name
 * @return {string} Corresponding mime-type
 */
exports.type = function(name) {
  if (typeof(mode.settings.types) != 'object') {
    return 'text/plain';
  }
  return mode.settings.types[name || 'default'];
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