/**
 * @class Base model
 */
module.exports = require('../class/base.js').extend(function(parent) {
  /**
   * Model collection class.
   *
   * @type {Class}
   * @see collection.base
   */
  this.static.collection = require('../collection/base.js');
  /**
   * Property pool.
   *
   * The property pool is for internal purposes only, and should
   * only be accessed using getters and setters, or the `toJSON`
   * method to export it entirely.
   *
   * @type {object}
   * @private
   * @see #update
   * @see #get
   * @see #set
   * @see #toJSON
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
   * TODO: Implement white/black list.
   *
   * @param {object} args New properties
   * @see #set
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
   * Implicit getter and setter accessors are also defined for
   * this property once it is set.
   *
   * Example:
   *
   *     user.set('name', 'John');
   *     console.log(user.name); // outputs 'John'
   *
   * @param {string} key Property name
   * @return {*} Property value
   * @see #defineAccessors
   */
  this.set = function(key, value) {
    this.defineAccessors(key);
    return this.data[key] = value;
  };
  /**
   * Define getter and setter accessors.
   *
   * An implicit getter and setter for the specified property
   * are created (if not already exist). So from that point on
   * they can be accessed directly from the model instance.
   *
   * However, _get_/_set_ should still be used for property
   * names that are already used by model classes internally.
   *
   * TODO: Check possible conficts from setting getter/setter
   * for existing key.
   *
   * @param {string} key Property name
   */
  this.defineAccessors = function(key) {
    var d = Object.getOwnPropertyDescriptor(this, key);
    if (!d || !d.get) {
      this.__defineGetter__(key, function() {
        return this.get(key);
      });
    }
    if (!d || !d.set) {
      this.__defineSetter__(key, function(value) {
        return this.set(key, value);
      });
    }
  };
  /**
   * Export model to JSON.
   *
   * @return {object} JSON-ready model data
   */
  this.toJSON = function() {
    // Clone data object
    var data = {};
    for (var i in this.data) {
      data[i] = this.data[i];
    }
    return data;
  };
}, true);