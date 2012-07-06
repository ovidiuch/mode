var mode = require('../../mode.js');

mode.model.Mongo = require('./base.js').extend(function(parent)
{
	this.static.connect = function(args, callback)
	{
		console.log('Connecting to Mongo database: ' + args.name);

		var mongo = require('mongodb');

		this.conn = new mongo.Db(args.name, new mongo.Server
		(
			args.host, args.port, args.options || {}
		));
		this.conn.open(function(error, conn)
		{
			if(error)
			{
				mode.error.throw(
				{
					code: 500, message: 'Mongo: ' + error
				});
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
		var args = { strict: false };

		this.conn.collection(this.collection, args, function(error, collection)
		{
			if(error)
			{
				mode.error.throw(
				{
					code: 500, message: 'Mongo: ' + error
				});
			}
			that.collection = collection;

			callback();
		});
	};
	this.instance = function(data)
	{
		parent.instance.call(this, data);
		
		this.collection = this.static.collection;
	};
	this.save = function(callback)
	{
		var that = this;

		this.collection.save(this.data, { safe: true }, function(error, item)
		{
			if(error)
			{
				mode.error.throw(
				{
					code: 500, message: 'Mongo: ' + error
				});
			}
			that.id = item._id;

			callback();
		});
	};
},
true);