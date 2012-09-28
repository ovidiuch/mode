var crypto = require('crypto');
/**
 * Get session by cookie group.
 *
 * Example:
 *
 *     // Init cookie and session
 *     var cookieGroup = cookie.init(req, res);
 *     var mySession = session.getByCookie(cookieGroup);
 *     // Use session object
 *     mySession.set('foo', 'bar');
 *
 * @param {cookie.Group} cookieGroup
 * @see cookie
 * @see #getById
 */
exports.getByCookie = function(cookieGroup) {
  // Attempt to fetch a session id from the cookie group
  var id = cookieGroup.get(COOKIE);
  var session = exports.getById(id);
  // Update the session id cookie when the fetched session has
  // an unknown id and was thus just created
  if (session.id != id) {
    cookieGroup.set({name: COOKIE, value: session.id, path: '/'});
  }
  return session;
};
/**
 * Get session by id.
 *
 * A new session is returned when an invalid (or even missing)
 * _id_ is passed.
 *
 * @param {string} Unique session id
 * @return {Session} Session instance
 * @see #Session
 */
exports.getById = function(id) {
  if (!id || !map[id]) {
    var session = new Session();
    // Return newly-created session whilst mapping it to its
    // own id
    return map[session.id] = session;
  }
  return map[id];
};
/**
 * A unique session wrapper.
 *
 * It has a reference to its own id and a data object that
 * can be populated through the session's getter and setter.
 *
 * @constructor
 * @private
 */
var Session = function() {
  this.id = this.uniqueId();
  this.data = {};
};
Session.prototype = {
  /**
   * Property getter.
   *
   * @param {string} key
   * @return {*} Value
   */
  get: function(key) {
    return this.data[key];
  },
  /**
   * Property setter.
   *
   * @param {string} key
   * @param {*} value
   */
  set: function(key, value) {
    this.data[key] = value;
  },
  /**
   * Generate unique id.
   *
   * @return {string} Generated id
   * @private
   */
  uniqueId: function() {
    var id;
    do {
      id = this.randomHash();
    } while (map[id]);
    return id;
  },
  /**
   * Generate random hash.
   *
   * @return {string} Generated hash
   * @private
   */
  randomHash: function() {
    var hash = crypto.createHash('sha1');
    hash.update(new Date().toGMTString(), 'utf8');
    return hash.digest('hex');
  }
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