var mode = require('../../mode.js');

mode.model.Base = mode.class.Base.extend(function(parent)
{
	this.data = {};

	this.instance = function(data)
	{
		if(data)
		{
			this.update(data);
		}
	};
	this.update = function(args)
	{
		for(var i in args)
		{
			this.data[i] = args[i];

			if(this[i] != undefined)
			{
				continue;
			}
			var that = this;

			this.__defineGetter__(i, function()
			{
				return that.get(i);
			});
			this.__defineSetter__(i, function(value)
			{
				return that.set(i, value);
			});
		}
	};
	this.get = function(key)
	{
		return this.data[key]
	};
	this.set = function(key, value)
	{
		return this.data[key] = value;
	};
},
true);

module.exports = mode.model.Base;