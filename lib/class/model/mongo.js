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
				that.error(500, error);
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
				that.error(500, error);
			}
			that.collection = collection;

			callback();
		});
	};
	this.static.list = function(args, callback)
	{
		var that = this;

		args = this.args(args);

		this.collection.find(args, function(error, cursor)
		{
			if(error)
			{
				that.error(500, error);
			}
			var items = [];

			cursor.each(function(error, item)
			{
				if(error)
				{
					that.error(500, error);
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

		args = this.args(args);

		this.collection.findOne(args, function(error, item)
		{
			if(error)
			{
				that.error(500, error);
			}
			callback(item ? new that(item) : null);
		});
	};
	this.static.delete = function(args, callback)
	{
		var that = this;

		args = this.args(args);
		
		this.collection.remove(args, function(error)
		{
			if(error)
			{
				that.error(500, error);
			}
			callback();
		});
	};
	this.static.args = function(args)
	{
		if(args.id)
		{
			try { args._id = new mongo.ObjectID(args.id); }

			catch(e)
			{
				this.error(404, e.message);
			}
			delete args.id;
		}
		return args;
	};
	this.static.error = function(code, message)
	{
		mode.error.throw(
		{
			code: code, message: 'Mongo: ' + message
		});
	};
	this.instance = function(data)
	{
		parent.instance.call(this, data);
		
		this.collection = this.static.collection;

		var that = this;

		this.__defineGetter__('id', function()
		{
			return that.get('_id');
		});
	};
	this.save = function(callback)
	{
		var that = this;

		this.collection.save(this.data, { safe: true }, function(error, item)
		{
			if(error)
			{
				that.error(500, error);
			}
			that.update(item);

			callback();
		});
	};
	this.destroy = function(callback)
	{
		this.static.delete(this.data, callback);
	};
	this.error = function(code, message)
	{
		this.static.error(code, message);
	};
},	
true);