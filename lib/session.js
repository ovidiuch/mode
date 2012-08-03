var crypto = require('crypto');
/**
 * Initialize request session.
 * @param {http.ServerRequest} req
*/
exports.init = function(req) {
  req.session = Session.get(req);
};
var map = {};
var Session = {
  /**
    Fetch request session.
    @param {http.ServerRequest} req
    @return {object} Session object
  */
  get: function(req) {
    var id = req.cookie.get(this.COOKIE);
    if (!id || !map[id]) {
      id = this.init(req);
    }
    return map[id];
  },
  /**
    Create session object.
    @param {http.ServerRequest} req
    @return {string} Session id
    @private
  */
  init: function(req) {
    var id = this.uniqueId();
    map[id] = {};
    req.cookie.set({name: this.COOKIE, value: id});
    return id;
  },
  /**
    Generate unique id.
    @return {string} Generated id
    @private
  */
  uniqueId: function() {
    var id;
    do {
      id = this.randomHash();
    } while (map[id]);
    return id;
  },
  /**
    Generate random hash.
    @return {string} Generated hash
    @private
  */
  randomHash: function() {
    var hash = crypto.createHash('sha1');
    hash.update(new Date().toGMTString(), 'utf8');
    return hash.digest('hex');
  }
};
Session.COOKIE = 'mode.session';