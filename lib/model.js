/**
 * Init database connection.
 *
 * Connect to specified database adaptor, and then init all of
 * its child models.
 *
 * After the adaptor's _connect_ callback is fired, all of its
 * children's _init_ methods are ran asynchronously and only
 * after every one of them fires its own callback is the user
 * callback ran.
 *
 * Example:
 *
 *     model.init({
 *       adaptor: mode.model.Mongo,
 *       host: '127.0.0.1',
 *       port: 27017,
 *       name: 'test'
 *     }, function() {
 *       console.log('Connected to Mongo DB!');
 *     });
 *
 * @param {object} args Database settings
 * @param {function} callback
 */
exports.init = function(args, callback) {
  var models = args.adaptor.children, count = 0;
  args.adaptor.connect(args, function() {
    if (!models.length) {
      if (typeof(callback) == 'function') {
        callback();
      }
      return;
    }
    for (var i in models) {
      models[i].init(function() {
        if (++count == models.length) {
          if (typeof(callback) == 'function') {
            callback();
          }
        }
      });
    }
  });
};