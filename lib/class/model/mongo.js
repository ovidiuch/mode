var mode = require('../../mode.js'), mongo;

mode.model.Mongo = require('./base.js').extend(function(parent)
{
	this.static.connect = function(args, callback)
	{
		mongo = require('mongodb');

		console.log('Connecting to Mongo database: ' + args.name);

		this.conn = new mongo.Db(args.name, new mongo.Server
		(
			args.host, args.port, args.options || {}
		));
		this.conn.open(this.bind(function(error, conn)
		{
			if(error)
			{
				this.throw(500, error);
			}
			callback();
		}));
	};
	this.static.init = function(callback)
	{
		console.log('Initialising Mongo collection: ' + this.collection);

		if(!this.conn)
		{
			this.conn = mode.model.Mongo.conn;
		}
		var options = { strict: false };

		this.conn.collection(this.collection, options, this.bind(function(error, collection)
		{
			if(error)
			{
				this.throw(500, error);
			}
			this.collection = collection;

			callback();
		}));
	};
	this.static.list = function(args, callback)
	{
		args = this.args(args);

		this.collection.find(args, this.bind(function(error, cursor)
		{
			if(error)
			{
				this.throw(500, error);
			}
			var items = [];

			cursor.each(this.bind(function(error, item)
			{
				if(error)
				{
					this.throw(500, error);
				}
				if(item == null)
				{
					callback(items);
				}
				items.push(new this(item));	
			}));
		}));
	};
	this.static.item = function(args, callback)
	{
		args = this.args(args);

		this.collection.findOne(args, this.bind(function(error, item)
		{
			if(error)
			{
				this.throw(500, error);
			}
			callback(item ? new this(item) : null);
		}));
	};
	this.static.delete = function(args, callback)
	{
		args = this.args(args);
		
		this.collection.remove(args, this.bind(function(error)
		{
			if(error)
			{
				this.throw(500, error);
			}
			callback();
		}));
	};
	this.static.args = function(args)
	{
		if(args.id)
		{
			try
			{
				args._id = new mongo.ObjectID(args.id);
			}
			catch(e)
			{
				this.throw(404, e.message);
			}
			delete args.id;
		}
		return args;
	};
	this.throw = this.static.throw = function(code, message)
	{
		mode.throw(code, 'Mongo: ' + message);
	};
	this.instance = function(data)
	{
		parent.instance.call(this, data);
		
		this.collection = this.static.collection;

		this.__defineGetter__('id', function()
		{
			return String(this.get('_id'));
		});
	};
	this.save = function(callback)
	{
		this.collection.save(this.data, { safe: true }, this.bind(function(error, item)
		{
			if(error)
			{
				this.throw(500, error);
			}
			this.update(item);

			callback();
		}));
	};
	this.destroy = function(callback)
	{
		this.static.delete(this.data, callback);
	};
},	
true);