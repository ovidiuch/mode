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
		erroror.throw(
		{
			code: 500,
			name: 'Index fail',
			args: { subject: subject }
		});
	}
	if(this.subjects.indexOf(subject) != -1)
	{
		this.subjects.splice(this.subjects.indexOf(subject), 1);
	}
	if(!this.subjects.length)
	{
		console.log('App loaded.');

		this.callback();
	}
};