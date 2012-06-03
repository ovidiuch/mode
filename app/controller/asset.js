var mode = require('../../lib/mode.js')

var controller = function(){};

controller.prototype.load = function()
{
	var path = mode.settings.path.base + '/app/assets' + this.args.path;

	// Make async

	return require('fs').readFileSync(path);
};
exports.controller = controller;