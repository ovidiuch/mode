var extension = require('./extension.js'),
    file = require('./file.js'),
    mustache = require('./mustache.js');
/**
 * Index folder of views.
 *
 * @param {string} path Folder path
 * @see file.readdir
 * @see extension.strip
 */
exports.index = function(path) {
  var relativePath;
  file.readdir(path, true).forEach(function(file) {
    relativePath = extension.strip(file);
    console.log('Loading view: ' + relativePath);
    map[relativePath] = new View(path + file);
  })
};
/**
 * Check if view exists.
 *
 * Example:
 *
 *     if (view.exists('/user/create')) {
 *       // View exists and can be rendered
 *     }
 *
 * @param {string} path
 * @return {boolean}
 */
exports.exists = function(path) {
  return map[path];
};
/**
 * Render view.
 *
 * View files with .mustache extension will be rendered
 * using the mustache module. Plain .html files will only
 * be loaded and minified.
 *
 * TODO: Add support for multiple template engines.
 *
 * Example:
 *
 *     view.render('/main/index', {
 *       message: "Hello World!"
 *     });
 *
 * @param {string} path
 * @param {object} args View arguments
 * @return {string} Rendered view
 * @see View.render
 */
exports.render = function(path, args) {
  console.log('Opening view: ' + path);
  if (!this.exists(path)) {
    return false;
  }
  return map[path].render(args);
};
/**
 * View wrapper.
 *
 * @constructor
 * @param {string} path File path
 * @private
 */
var View = function(path) {
  this.path = path;
  this.original = String(require('fs').readFileSync(this.path));
};
View.prototype = {
  /**
   * Render view.
   *
   * If no arguments are specified, the original view file
   * contents are returned.
   *
   * @param {object} args View arguments
   * @return {string} Rendered view
   * @see mustache.parse
   */
  render: function(args) {
    var content = this.original;
    if (!args) {
      return content;
    }
    if (extension.extract(this.path) == 'mustache') {
      content = mustache.parse(content, args);
    }
    return this.minify(content);
  },
  /**
   * Minify view output.
   *
   * @param {string} output
   * @return {string} Minified string
   */
  minify: function(output) {
    return output.replace(/\n|\t/g, '').replace(/\s{2,}/g, ' ');
  }
};
/**
 * Map of indexed views.
 *
 * @type {Object}
 * @private
 */
var map = {};