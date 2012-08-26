/**
 * @class Error controller
 * @see mode.error.handle
 */
module.exports = require('./base.js').extend(function() {
  this.show = function() {
    return '<h1>{{code}}: {{message}}</h1>';
  };
});