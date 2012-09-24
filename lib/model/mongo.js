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
      this.conn = module.exports.conn;
    }
    var options = { strict: false };
    this.conn.collection(this.group, options, this.bind(function(error, collection) {
      if (error) {
        this.throw(500, error);
      }
      this.collection = collection;
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
   * @throws {Error} On Mongo error
   * @see #process
   */
  this.static.list = function(args, callback) {
    args = this.process(args);
    this.collection.find(args, this.bind(function(error, cursor) {
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
   * @throws {Error} On Mongo error
   * @see #process
   */
  this.static.item = function(args, callback) {
    args = this.process(args);
    this.collection.findOne(args, this.bind(function(error, item) {
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
   * @throws {Error} On Mongo error
   * @see #process
   */
  this.static.delete = function(args, callback) {
    args = this.process(args);
    this.collection.remove(args, this.bind(function(error) {
      if (error) {
        this.throw(500, error);
      }
      callback();
    }));
  };
  /**
   * Process properties.
   *
   * Currently only used for mapping the `id` key to the proper
   * Mongo key/value.
   *
   * @param {object} args Item properties
   * @return {object} Processed properties
   */
  this.static.process = function(args) {
    if (args.id) {
      try {
        args._id = new mongo.ObjectID(args.id);
      } catch(e) {
        this.throw(404, e.message);
      }
      delete args.id;
    }
    return args;
  };
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
   * Instance constructor.
   *
   * Automatically defines getter for the _id_ property; which,
   * in the case of Mongo objects, is received as `_id`.
   *
   * @param {object} data
   */
  this.instance = function(data) {
    parent.instance.call(this, data);
    this.collection = this.static.collection;
    this.__defineGetter__('id', function() {
      return String(this.get('_id'));
    });
  };
  /**
   * Save or update item.
   *
   * @param {function} callback
   * @throws {Error} On Mongo error
   */
  this.save = function(callback) {
    this.collection.save(this.data, { safe: true }, this.bind(function(error, item) {
      if (error) {
        this.throw(500, error);
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
  this.throw = this.static.throw;
}, true);