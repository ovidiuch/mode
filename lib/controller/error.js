/**
 * @class Error controller
 * @see error.handle
 */
module.exports = require('./base.js').extend(function() {
  this.action.show = function() {
    return '<h1>{{code}}: {{message}}</h1>';
  };
});