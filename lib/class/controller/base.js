var mode = require('../../mode.js');
/**
 * @class Base controller
 */
module.exports = require('../base.js').extend(function(parent) {
  /**
   * Instance constructor.
   *
   * Initiates the args property, which gets more values
   * assigned from the controller action along the way, and
   * then, eventually, ends up being the view arguments.
   *
   * @param {object} args
   * @param {mode.server.Connection} conn
   */
  this.instance = function(args, conn) {
    parent.instance.call(this);
    this.args = args;
    this.conn = conn;
    this.domain = this.conn.domain;
    this.data = this.conn.data;
  };
  /**
   * Controller init.
   *
   * Ran before any action requested.
   */
  this.init = function() {
    this.args.layout = 'default';
  };
  /**
   * Load different controller action.
   *
   * The path is mustache-parsed for variables, using the
   * controller arguments.
   *
   * TODO: Add namespace awareness and relative paths
   *
   * @param {string} query
   * @param {object} args
   * @see mode.path.load
   * @see mode.mustache.parse
   */
  this.load = function(query, args) {
    query = mode.mustache.parse(query, this.args);
    mode.path.load(query, args, this.conn);
  };
  /**
   * Redirect to url.
   *
   * @param {string} query
   * @param {object} args
   * @see mode.path.redirect
   */
  this.redirect = function(query, args) {
    query = mode.mustache.parse(query, this.args);
    mode.path.redirect(query, args, this.conn);
  };
}, true);