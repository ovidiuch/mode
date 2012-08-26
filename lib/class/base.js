var mode = require('../mode.js');
/**
 * @class Base class
 * @see mode.class.extend
 */
module.exports = mode.class.Base.extend(function(parent) {
  /**
   * Bind function to class scope.
   *
   * The function is also bound to the instance domain, if
   * it has one assigned.
   *
   * TODO: Implement multiple binding levels, maybe use
   * number instead of boolean.
   *
   * @param {Function} fn
   * @return {Function} Bound function
   */
  this.static.bind = function(fn) {
    this.bound = true;
    if (this.domain) {
      fn = this.domain.bind(fn);
    }
    var that = this;
    return function() {
      fn.apply(that, arguments);
    };
  };
  this.static.call = function(method) {
    if (typeof(this[method]) != 'function') {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    return this[method].apply(this, args);
  };
  /**
   * Instance constructor.
   */
  this.instance = function() {
  };
  this.bind = this.static.bind;
  this.call = this.static.call;
}, true);