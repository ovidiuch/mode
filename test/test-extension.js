var assert = require('assert'),
    extension = require('../lib/extension.js');

var baseQuery = '/path/to/something';
var suffixes = [
  // Query has nothing succedding the extension
  '',
  // Query has a query string
  '?query=string&one=1',
  // Query has a hashtag
  '#hash-tag',
  // Query has both a query string and a hastag
  '?query=string&one=1#hash-tag'
];

suffixes.forEach(function(suffix) {
  var query = baseQuery + '.ext' + suffix;

  // Removing existing extension
  query = extension.strip(query);
  assert.equal(query, baseQuery + suffix);

  // Extract inexisting extension
  assert.equal(extension.extract(query), '');

  // Strip inexisting extension
  assert.equal(extension.strip(query), query);

  // Add extension when none is present
  query = extension.change(query, 'js');
  assert.equal(query, baseQuery + '.js' + suffix);

  // Change existing extension
  query = extension.change(query, 'html');
  assert.equal(query, baseQuery + '.html' + suffix);

  // Extract current extension
  assert.equal(extension.extract(query), 'html');
});