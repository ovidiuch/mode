/**
 * @class Base model
 */
module.exports = require('../class/base.js').extend(function(parent) {
  /**
   * Property pool.
   *
   * TODO: Make private.
   *
   * @type {object}
   */
  this.data = {};
  /**
   * Instance constructor.
   *
   * @param {object} data Initial model data
   * @see #update
   */
  this.instance = function(data) {
    parent.instance.call(this);
    this.update(data || {});
  };
  /**
   * Mass-assignment.
   *
   * TODO: Implement white list.
   *
   * @param {object} args New properties
   */
  this.update = function(args) {
    for(var i in args) {
      this.set(i, args[i]);
    }
  };
  /**
   * Explicit property getter.
   *
   * @param {string} key Property name
   * @return {*} Found property value
   */
  this.get = function(key) {
    return this.data[key]
  };
  /**
   * Explicit property setter.
   *
   * Once a property is set for a model, an implicit getter
   * and setter for that property are created. So from that
   * point on they can be accessed directly from the model
   * object.
   *
   * However, _get_/_set_ should still be used for property
   * names that are already used by model classes internally.
   *
   * Example:
   *
   *     user.set('name', 'John');
   *     console.log(user.name); // outputs 'John'
   *
   * TODO: Check possible conficts from setting getter/setter
   * for existing key.
   *
   * @param {string} key Property name
   * @return {*} Property value
   */
  this.set = function(key, value) {
    if (this.data[key] == undefined) {
      this.__defineGetter__(key, function() {
        return this.get(key);
      });
      this.__defineSetter__(key, function(value) {
        return this.set(key, value);
      });
    }
    return this.data[key] = value;
  };
}, true);