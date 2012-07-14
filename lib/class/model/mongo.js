var mode = require('../../mode.js');

var mongo = require('mongodb');

mode.model.Mongo = require('./base.js').extend(function(parent)
{
	this.static.connect = function(args, callback)
	{
		console.log('Connecting to Mongo database: ' + args.name);

		var that = this;

		this.conn = new mongo.Db(args.name, new mongo.Server
		(
			args.host, args.port, args.options || {}
		));
		this.conn.open(function(error, conn)
		{
			if(error)
			{
				that.error(error);
			}
			callback();
		});
	};
	this.static.init = function(callback)
	{
		console.log('Initialising Mongo collection: ' + this.collection);

		var that = this;

		if(!this.conn)
		{
			this.conn = mode.model.Mongo.conn;
		}
		var options = { strict: false };

		this.conn.collection(this.collection, options, function(error, collection)
		{
			if(error)
			{
				that.error(error);
			}
			that.collection = collection;

			callback();
		});
	};
	this.static.list = function(args, callback)
	{
		var that = this;

		this.collection.find(args, function(error, cursor)
		{
			if(error)
			{
				that.error(error);
			}
			var items = [];

			cursor.each(function(error, item)
			{
				if(error)
				{
					that.error(error);
				}
				if(item == null)
				{
					callback(items);
				}
				items.push(new that(item));	
			});
		});
	};
	this.static.item = function(args, callback)
	{
		var that = this;

		this.collection.findOne(args, function(error, item)
		{
			if(error)
			{
				that.error(error);
			}
			callback(new that(item));
		});
	};
	this.static.delete = function(args, callback)
	{
		var that = this;

		if(args.id)
		{
			args._id = new mongo.ObjectID(args.id);

			delete args.id;
		}
		this.collection.remove(args, function(error, result)
		{
			if(error)
			{
				that.error(error);
			}
			callback(result);
		});
	};
	this.static.error = function(message)
	{
		mode.error.throw(
		{
			code: 500, message: 'Mongo: ' + message
		});
	};
	this.instance = function(data)
	{
		parent.instance.call(this, data);
		
		this.collection = this.static.collection;
	};
	this.set = function(key, value)
	{
		parent.set.call(this, key, value);

		if(key == '_id')
		{
			this.set('id', value);
		}
	};
	this.save = function(callback)
	{
		var that = this;

		this.collection.save(this.data, { safe: true }, function(error, item)
		{
			if(error)
			{
				that.error(error);
			}
			that.update(item);

			callback();
		});
	};
	this.destroy = function(callback)
	{
		this.static.delete(this.data, callback);
	};
	this.error = function(message)
	{
		this.static.error(message);
	};
},	
true);