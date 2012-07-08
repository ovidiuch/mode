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
			(function(object, key)
			{
				this.__defineGetter__(key, function()
				{
					return object.get(key);
				});
				this.__defineSetter__(key, function(value)
				{
					return object.set(key, value);
				});
			})
			.call(this, this, i);
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