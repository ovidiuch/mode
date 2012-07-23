var mode = require('../../mode.js');

(mode.controller = {}).Base = require('../base.js').extend(function(parent)
{
	this.redirect = function(query, args)
	{
		query = mode.mustache.parse(query, this.args);

		mode.path.redirect(query, args, this.conn);
	};
},
true);

module.exports = mode.controller.Base;