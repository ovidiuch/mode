var fs = require('fs');
/**
 * Read folder contents.
 *
 * Caution: Because this function is synchron, it should only
 * be used at startup and never at run-time.
 *
 * @param {string} path
 * @param {boolean} recursive
 * @param {string} prefix Path prefix, used by recurring calls
 * @return {Array} List of files found
 */
exports.readdir = function(path, recursive, prefix) {
  if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
    return [];
  }
  // Set prefix empty on first call
  if (!prefix) {
    prefix = '';
  }
  var list = [], absPath, relPath;
  fs.readdirSync(path).forEach(function(name) {
    absPath = path + '/' + name;
    relPath = prefix + '/' + name;
    if (!fs.statSync(absPath).isDirectory()) {
      // Ignore files that start with a dot
      if (!name.match(/^\./)) {
        list.push(relPath);
      }
    } else if (recursive) {
      exports.readdir(absPath, recursive, relPath).forEach(function(subPath) {
        list.push(subPath);
      });
    }
  });
  return list;
};
/**
 * Index folder contents.
 *
 * Read all files from a folder and run them through a
 * user callback.
 *
 * @param {string} path
 * @param {boolean} recursive
 * @param {function} callback
 * @see extension.strip
 * @see #readdir
 */
exports.index = function(path, recursive, callback) {
  this.readdir(path, recursive).forEach(function(file) {
    callback(require('./extension.js').strip(file), require(path + file));
  });
};