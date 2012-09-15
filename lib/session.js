var crypto = require('crypto');
/**
 * Initialize request session.
 *
 * Search for an existing one, create a new one if not found,
 * and attach it to the specified server request.
 *
 * A session can be attached to any http.ServerRequest that
 * already has mode.cookie (see module) attached to it.
 *
 * Example:
 *
 *     // Init cookie and session
 *     cookie.init(req, res);
 *     session.init(req);
 *     // Use session object
 *     req.session.foo = 'bar';
 *
 * @param {http.ServerRequest} req
 * @see cookie
 */
exports.init = function(req) {
  req.session = fetch(req);
};
/**
 * Name of cookie that stores session id.
 *
 * @type {string}
 * @const
 * @private
 */
var COOKIE = 'mode.session';
/**
 * Storage map for all session objects.
 *
 * @type {object}
 * @private
 */
var map = {};
/**
 * Fetch request session.
 *
 * @param {http.ServerRequest} req
 * @return {object} Session object
 * @private
 */
var fetch = function(req) {
  var id = req.cookie.get(COOKIE);
  if (!id || !map[id]) {
    id = create(req);
  }
  return map[id];
};
/**
 * Create session object.
 *
 * @param {http.ServerRequest} req
 * @return {string} Session id
 * @private
 */
var create = function(req) {
  var id = uniqueId();
  map[id] = {};
  req.cookie.set({name: COOKIE, value: id, path: '/'});
  return id;
};
/**
 * Generate unique id.
 *
 * @return {string} Generated id
 * @private
 */
var uniqueId = function() {
  var id;
  do {
    id = randomHash();
  } while (map[id]);
  return id;
};
/**
 * Generate random hash.
 *
 * @return {string} Generated hash
 * @private
 */
var randomHash = function() {
  var hash = crypto.createHash('sha1');
  hash.update(new Date().toGMTString(), 'utf8');
  return hash.digest('hex');
};