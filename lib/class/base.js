/**
 * @class Base class
 * @see class.extend
 */
module.exports = require('../class.js').Base.extend(function(parent) {
  /**
   * Bind function to class scope.
   *
   * The function is also bound to the instance domain, if
   * it has one assigned.
   *
   * TODO: Implement multiple binding levels, maybe use
   * number instead of boolean.
   *
   * @param {function} fn
   * @return {function} Bound function
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
  /**
   * Instance constructor.
   */
  this.instance = function() {};
  this.bind = this.static.bind;
}, true);