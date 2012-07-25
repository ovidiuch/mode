var mode = require('../../mode.js');

mode.model.Base = require('../base.js').extend(function(parent)
{
	this.data = {};

	this.instance = function(data)
	{
		this.update(data || {});
	};
	this.update = function(args)
	{
		for(var i in args)
		{
			this.set(i, args[i]);
		}
	};
	this.get = function(key)
	{
		return this.data[key]
	};
	this.set = function(key, value)
	{
		if(this.data[key] == undefined)
		{
			this.__defineGetter__(key, function()
			{
				return this.get(key);
			});
			this.__defineSetter__(key, function(value)
			{
				return this.set(key, value);
			});
		}
		return this.data[key] = value;
	};
},
true);

module.exports = mode.model.Base;