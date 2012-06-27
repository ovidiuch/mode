var mode = require('../../mode.js');

mode.model.Base = mode.class.Base.extend(function(parent)
{
	this.data = {};

	this.new = function(data)
	{
		this.data = data || {};
	};
},
true);

module.exports = mode.model.Base;