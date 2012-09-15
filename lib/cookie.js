/**
 * Initialize a new cookie group for a specific http connection.
 *
 * A cookie group is used to manage the current user's cookies
 * and it's tied to the request object for future operations.
 *
 * Example:
 *
 *     // Init cookie
 *     cookie.init(req, res);
 *     // Use cookie methods
 *     req.cookie.get('foo');
 *     req.cookie.set({
 *       name: 'foo', value: 'bar', duration: 86400
 *     });
 *
 * @param {http.ServerRequest} req
 * @param {http.ServerResponse} res
 */
exports.init = function(req, res) {
  req.cookie = new Group(req, res);
};
/**
 * A group of cookies tied to an http request.
 *
 * @constructor
 * @param {http.ServerRequest} req
 * @param {http.ServerResponse} res
 * @private
 */
var Group = function(req, res) {
  this.req = req;
  this.res = res;
  this.map = this.fetch(req.headers.cookie || '');
};
Group.prototype = {
  /**
   * Fetch cookie value.
   *
   * @param {string} name
   * @return {string} Cookie value
  */
  get: function(name) {
    if (!this.map[name]) {
      return;
    }
    return this.map[name].value;
  },
  /**
   * Set cookie data.
   *
   * Supported params:
   *
   *   - {string} name (required)
   *   - {string} value
   *   - {number} duration (seconds from now)
   *   - {string} domain
   *   - {string} path
   *   - {boolean} secure
   *   - {boolean} httpOnly
   *
   * @param {Array} args Cookie args
  */
  set: function(args) {
    if (!args.name) {
      return;
    }
    args.new = true;
    this.map[args.name] = new Cookie(args);
    this.update();
  },
  /**
   * Fetch existing cookies from request headers.
   *
   * @param {string} Cookie header
   */
  fetch: function(header) {
    var map = {}, parts;
    header.split(';').forEach(function(cookie) {
      parts = cookie.trim().split('=');
      map[parts[0]] = new Cookie({
        name: parts[0], value: parts[1]
      });
    });
    return map;
  },
  /**
   * Update response headers with current cookie data.
   */
  update: function() {
    var list = [];
    for (var i in this.map) {
      if (this.map[i].new) {
        list.push(String(this.map[i]));
      }
    }
    this.res.setHeader('Set-Cookie', list);
  }
};
/**
 * Browser cookie wrapper.
 *
 * @constructor
 * @params {object} args Cookie data
 * @private
 */
var Cookie = function(args) {
  for (var i in args) {
    // Decode data if it's loaded from the request headers
    this[i] = !args.new ? this.decode(args[i]) : args[i];
  }
};
Cookie.prototype = {
  /**
   * Cast cookie into an http header Set-Cookie directive
   * compatible string.
   *
   * Name and value are url-encoded in the process.
   *
   * return {string} Cookie header data
   */
  toString: function() {
    var parts = [
      this.encode(this.name) + '=' + this.encode(this.value)
    ];
    if (this.duration) {
      var date = new Date();
      date.setTime(date.getTime() + this.duration * 1000);
      parts.push('Expires=' + date.toGMTString());
    }
    if (this.domain) {
      parts.push('Domain=' + this.domain);
    }
    if (this.path) {
      parts.push('Path=' + this.path);
    }
    if (this.secure) {
      parts.push('Secure');
    }
    if (this.httpOnly) {
      parts.push('HttpOnly');
    }
    return parts.join('; ');
  },
  /**
   * Url-encode string value.
   *
   * @param {string} value
   * @return {string} Encoded value
   */
  encode: function(value) {
    if (typeof value != 'string') {
      return value;
    }
    return encodeURIComponent(value);
  },
  /**
   * Url-decode string value.
   *
   * @param {string} value
   * @return {string} Decoded value
   */
  decode: function(value) {
    if (typeof value != 'string') {
      return value;
    }
    return decodeURIComponent(value);
  }
};