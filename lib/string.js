/**
 * Convert string to camel case.
 *
 * Supported separators:
 *
 *   - hyphen
 *   - underscore
 *   - space
 *
 * @param {string} str String to convert
 * @param {boolean} capitalize Capitalize first letter
 * @return {string} Camel-cased string
 */
exports.toCamelCase = function(str, capitalize) {
  return str.replace(/(^|-|_| )([a-z])/ig, function(match, separator, letter) {
    return !separator && !capitalize ? letter : letter.toUpperCase();
  });
};