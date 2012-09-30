/**
 * @class Base model collection
 */
module.exports = require('../class/base.js').extend(function(parent) {
  /**
   * Model pool.
   *
   * @type {Array}
   */
  this.models = [];
  /**
   * Instance constructor.
   *
   * @param {Array} models
   */
  this.instance = function(models) {
    this.models = models || [];
  };
  /**
   * Export collection to JSON.
   *
   * Each of the collection's models are themselves converted
   * to JSON, one by one, and returned in bulk again.
   *
   * @return {Array} List of JSON-converted models
   */
  this.toJSON = function() {
    var list = [];
    this.models.forEach(function(model) {
      list.push(model.toJSON());
    });
    return list;
  };
});