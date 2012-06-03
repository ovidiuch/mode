exports.init = function(subjects, callback)
{
	console.log('Loading app...');

	this.subjects = subjects;
	this.callback = callback;

	var self = this;

	for(var i = 0; i < this.subjects.length; i++)
	{
		this.subjects[i].index(function(error, subject)
		{
			self.response(error, subject);
		});
	}
};
exports.response = function(error, subject)
{
	if(error)
	{
		error.throw(
		{
			code: 500,
			name: 'index_fail',
			keyword: subject
		});
	}
	if(this.subjects.indexOf(subject) != -1)
	{
		this.subjects.splice(this.subjects.indexOf(subject), 1);
	}
	if(!this.subjects.length)
	{
		console.log('App ready.');

		this.callback();
	}
};