var mode = require('../../mode.js');

mode.model.Base = mode.class.Base.extend(function(parent)
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
			var that = this;

			this.__defineGetter__(key, function()
			{
				return that.get(key);
			});
			this.__defineSetter__(key, function(value)
			{
				return that.set(key, value);
			});
		}
		return this.data[key] = value;
	};
},
true);

module.exports = mode.model.Base;