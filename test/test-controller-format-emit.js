var assert = require('assert'),
    BaseController = require('../lib/controller/base.js');

var controller = new BaseController();
var bouncer = {};

// Universal event handler
controller.on('test', function(bouncer) {
  bouncer.response = 'test';
});

// Format-specific event handlers
controller.on('test-default', function(bouncer) {
  bouncer.response += '-default';
});
controller.on('test-json', function(bouncer) {
  bouncer.response += '-json';
});

// Emit event without setting any format
controller.emit('test', bouncer);
assert.equal(bouncer.response, 'test-default');

// Emit event with format and listeners
controller.format = 'json';
controller.emit('test', bouncer);
assert.equal(bouncer.response, 'test-json');

// Emit event with format but w/out listeners
controller.format = 'xml';
controller.emit('test', bouncer);
assert.equal(bouncer.response, 'test-default');