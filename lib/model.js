var mode = require('./mode.js');

exports.init = function(args, callback)
{
	var models = args.adaptor.children, count = 0;
	
	args.adaptor.connect(args, function()
	{
		for(var i in models)
		{
			models[i].init(function()
			{
				if(++count == models.length)
				{
					callback();
				}
			});
		}
	});
};