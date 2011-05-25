exports.init = function(subjects, callback)
{
    console.log('Indexing app...');

    this.subjects = subjects;
    this.callback = callback;

    var self = this;
    
    for(var i = 0; i < this.subjects.length; i++)
    {
        this.subjects[i].index(function(err, subject)
        {
            self.response(err, subject);
        });
    }
};
exports.response = function(err, subject)
{
    if(err)
    {
        error.throw({
           code: 500,
           name: 'index_fail',
           args: { subject: subject }
        });
    }
    if(this.subjects.indexOf(subject) != -1)
    {
        this.subjects.splice(this.subjects.indexOf(subject), 1);
    }
    if(!this.subjects.length)
    {
        this.callback();
    }
};