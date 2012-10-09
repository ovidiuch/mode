/**
 * @class Error controller
 * @see error.handle
 */
module.exports = require('./base.js').extend(function() {
  this.action.show = function() {
    this.vars.code = this.args.code;
    this.vars.message = this.args.message;
    return '<h1>{{code}}: {{message}}</h1>';
  };
});