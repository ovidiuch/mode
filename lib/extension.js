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
 * Change path query extension.
 *
 * @param {string} query Path query
 * @param {string} extension New extension
 * @return {string} Updated query
 */
exports.change = function(query, extension) {
  return query.replace(MATCH, '.' + extension + '$3');
};
/**
 * Extract extension from path query.
 *
 * Returns an empty string when no extension is found.
 *
 * @param {string} query Path query
 * @return {string} Identified extension
 */
exports.extract = function(query) {
  var match = query.match(MATCH);
  return match && match[2] ? match[2] : '';
};
/**
 * Strip extension from path query.
 *
 * Query stays intact if no extension is found.
 *
 * @param {string} query Path query
 * @return {strip} Stripped path query
 */
exports.strip = function(query) {
  return query.replace(MATCH, '$3');
};
/**
 * Extension-matching pattern.
 *
 * @type {RegExp}
 * @const
 * @private
 */
var MATCH = /(\.([a-z0-9-]*))?([?#].*)?$/i;