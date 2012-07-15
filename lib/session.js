var crypto = require('crypto');

exports.init = function(req)
{
	req.session = Session.get(req);
};
var map = {};

var Session =
{
	get: function(req)
	{
		var id = req.cookie.get(this.COOKIE);

		if(!id || !map[id])
		{
			map[id = this.key()] = {};

			req.cookie.set(
			{
				name: this.COOKIE, value: id
			});
		}
		return map[id];
	},
	key: function()
	{
		var key;

		while(!map[key = this.hash()])
		{
			return key;
		}
	},
	hash: function()
	{
		var hash = crypto.createHash('sha1');

		hash.update(new Date().toGMTString(), 'utf8');

		return hash.digest('hex');
	}
};
Session.COOKIE = 'mode.session';