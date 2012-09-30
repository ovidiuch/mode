var error = require('../error.js'), mongo;
/**
 * @class Mongo model
 */
module.exports = require('./base.js').extend(function(parent) {
  /**
   * Connect adaptor to database.
   *
   * @param {object} settings
   * @param {function} callback
   * @throws {Error} If could not connect
   */
  this.static.connect = function(settings, callback) {
    // Only require mongodb here, in case module is not installed and
    // the Mongo model will never be requested.
    mongo = require('mongodb');
    console.log('Connecting to Mongo database: ' + settings.name);
    this.conn = new mongo.Db(settings.name, new mongo.Server(
      settings.host,
      settings.port,
      settings.options || {}
    ));
    this.conn.open(this.bind(function(error, conn) {
      if (error) {
        this.throw(500, error);
      }
      if (typeof(callback) == 'function') {
        callback();
      }
    }));
  };
  /**
   * Init collection.
   *
   * Requires a `this.group` property to be set in the model
   * subclass definition, corresponding to a db table/collection.
   *
   * @param {function} callback
   * @throws {Error} If could not init
   */
  this.static.init = function(callback) {
    console.log('Initializing Mongo collection: ' + this.group);
    if (!this.conn) {
      // If this is ran in a subclass, reference the Mongo
      // connection from this module's closure
      this.conn = module.exports.conn;
    }
    var options = {strict: false};
    this.conn.collection(this.group, options, this.bind(function(error, collection) {
      if (error) {
        this.throw(500, error);
      }
      this.mongoCollection = collection;
      if (typeof(callback) == 'function') {
        callback();
      }
    }));
  };
  /**
   * Get item list.
   *
   * Callback returns an array regardless or the number of
   * results.
   *
   * @param {args} args Matching item properties
   * @param {function} callback
   * @throws {Error} On mongo error
   * @see #process
   */
  this.static.list = function(args, callback) {
    // Process args by running them through a fresh instance
    var query = new this(args).data;
    this.mongoCollection.find(query, this.bind(function(error, cursor) {
      if (error) {
        this.throw(500, error);
      }
      var items = [];
      cursor.each(this.bind(function(error, item) {
        if (error) {
          this.throw(500, error);
        }
        if (item == null) {
          callback(items);
        }
        items.push(new this(item));
      }));
    }));
  };
  /**
   * Get single item.
   *
   * A model instance for requested item, if found, will be
   * referenced as the first callback argument.
   *
   * @param {args} args Matching item properties
   * @param {function} callback
   * @throws {Error} On mongo error
   * @see #process
   */
  this.static.item = function(args, callback) {
    // Process args by running them through a fresh instance
    var query = new this(args).data;
    this.mongoCollection.findOne(query, this.bind(function(error, item) {
      if (error) {
        this.throw(500, error);
      }
      callback(item ? new this(item) : null);
    }));
  };
  /**
   * Delete one or more items.
   *
   * One or more items can match the arguments passed.
   * Naturally, specifying an `id` assures deletion of a
   * single item only.
   *
   * @param {args} args Matching item properties
   * @param {function} callback
   * @throws {Error} On mongo error
   * @see #process
   */
  this.static.delete = function(args, callback) {
    // Process args by running them through a fresh instance
    var query = new this(args).data;
    this.mongoCollection.remove(query, this.bind(function(error) {
      if (error) {
        this.throw(500, error);
      }
      callback();
    }));
  };
  /**
   * Convert stringified id to mongo ObjectID.
   *
   * @parms {string} id
   * @return {mongo.ObjectID} Internal mongo id object
   * @throws {Error} If id string is invalid
   */
  this.static.getObjectId = function(id) {
    try {
      return new mongo.ObjectID(id);
    } catch(e) {
      this.throw(404, e.message);
    }
  }
  /**
   * Shorthand function for throwing exceptions.
   *
   * @param {number} code
   * @param {string} message
   * @throws {Error}
   * @see error
   */
  this.static.throw = function(code, message) {
    error.throw(code, 'Mongo: ' + message);
  };
  /**
   * Explicit property getter.
   *
   * Extended to provide a stringified id value for the
   * "id" key.
   *
   * @param {string} key Property name
   * @return {*} Found property value
   */
  this.get = function(key) {
    if (key == 'id') {
      return String(this.get('_id'));
    }
    return parent.get.call(this, key);
  };
  /**
   * Explicit property setter.
   *
   * Extended to make the assigning of both an internal "_id"
   * object and a stringified "id" possible.
   *
   * @param {string} key Property name
   * @return {*} Property value
   * @see #defineAccessors
   */
  this.set = function(key, value) {
    // Default to super for non-id keys
    if (['_id', 'id'].indexOf(key) == -1) {
      return parent.set.call(this, key, value);
    }
    // The id will always be accessed through the "id" accessors
    this.defineAccessors('id');
    // If a stringified id value is assigned, attempt to convert
    // it into a mongo ObjectID
    if (typeof(value) == 'string') {
      value = this.static.getObjectId(value);
    }
    // Always assign the id value for the "_id" key
    return this.data['_id'] = value;
  }
  /**
   * Save or update item.
   *
   * @param {function} callback
   * @throws {Error} On mongo error
   */
  this.save = function(callback) {
    this.static.mongoCollection.save(this.data, {safe: true}, this.bind(function(error, item) {
      if (error) {
        this.static.throw(500, error);
      }
      this.update(item);
      callback();
    }));
  };
  /**
   * Destroy item.
   *
   * @param {function} callback
   * @see #delete
   */
  this.destroy = function(callback) {
    this.static.delete(this.data, callback);
  };
  /**
   * Export model to JSON.
   *
   * Extended to replace the internal "_id" object value with
   * a stringified-equivalent "id" one.
   *
   * @return {object} JSON-converted model data
   * @see model.Base#toJSON
   */
  this.toJSON = function() {
    var data = parent.toJSON.call(this);
    // Remove internal id value from data
    delete data['_id'];
    // Attach stringified id through explicit getter
    data['id'] = this.get('id');
    return data;
  };
}, true);