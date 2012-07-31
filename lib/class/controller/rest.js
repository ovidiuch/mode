var mode = require('../../mode.js');

mode.controller.REST = require('./base.js').extend(function()
{
	this.index = function()
	{
		this.model.list({}, this.bind(function(items)
		{
			this.args.items = items;

			this.callback();
		}));
	};
	this.show = function()
	{
		this.model.item({ id: this.args.id }, this.bind(function(item)
		{
			if(!item)
			{
				mode.throw(404, 'Invalid id');
			}
			this.args.item = item;

			this.callback();
		}));
	};
	this.new = function()
	{
		this.args.item = new this.model();
	};
	this.edit = function()
	{
		this.model.item({ id: this.args.id }, this.bind(function(item)
		{
			if(!item)
			{
				mode.throw(404, 'Invalid id');
			}
			this.args.item = item;

			this.callback();
		}));
	};
	this.create = function()
	{
		var data = this.data[this.model.group];

		if(!data)
		{
			mode.throw(404, 'No POST data');
		}
		var item = new this.model(data);

		item.save(this.bind(function(error)
		{
			this.call('created', error);

			if(!error)
			{
				this.redirect('/{{controller}}');

				return;
			}
			this.args.item = item;

			this.callback('{{controller}}/new');
		}));
	};
	this.update = function()
	{
		var data = this.data[this.model.group];

		if(!data)
		{
			mode.throw(404, 'No POST data');
		}
		this.model.item({ id: data.id }, this.bind(function(item)
		{
			if(!item)
			{
				mode.throw(404, 'Invalid id');
			}
			(this.args.item = item).update(data);

			this.args.item.save(this.bind(function(error)
			{
				this.call('updated', error);

				if(!error)
				{
					this.redirect('/{{controller}}/edit', { id: item.id });

					return;
				}
				this.callback('{{controller}}/edit');
			}));
		}));
	};
	this.delete = function()
	{
		var data = this.data[this.model.group];

		if(!data)
		{
			mode.throw(404, 'No POST data');
		}
		this.model.item({ id: data.id }, this.bind(function(item)
		{
			if(!item)
			{
				mode.throw(404, 'Invalid id');
			}
			item.destroy(this.bind(function(error)
			{
				this.call('deleted', error);

				this.redirect('/{{controller}}');
			}));
		}));
	};
},
true);