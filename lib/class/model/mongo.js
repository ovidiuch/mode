var mode = require('../../mode.js');
var mongo = require('mongodb');

mode.model.Mongo = require('./base.js').extend(function(parent)
{
	this.static.connect = function(args, callback)
	{
		console.log('Connecting to Mongo database: ' + args.name);

		this.conn = new mongo.Db(args.name, new mongo.Server
		(
			args.host, args.port, args.options || {}
		));
		this.conn.open(function(error, conn)
		{
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
			that.collection = collection;

			callback();
		});
	};
	this.static.list = function(args, callback)
	{
		var that = this;

		this.collection.find(args, function(error, cursor)
		{
			var items = [];

			cursor.each(function(error, item)
			{
				console.log('each', item);

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
			callback(result);
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

		this.collection.save(this.data, function(error, item)
		{
			that.update(item);

			callback();
		});
	};
},
true);