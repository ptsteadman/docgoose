var mongoose = require('mongoose');
var Document = mongoose.model('Document');

exports.createDocument = function(data, callback){
	var document = new Document({
		_id: data.key,
		name: data.name,
		link: 'https://s3-us-west-2.amazonaws.com/docgoose/' + data.key,
		_course: data.course
	});
	document.save(function(err){
        if(!err){
        	console.log(data.key + ' saved');
        	callback();
        } else {
            return console.log(err);
        }
	})
}


exports.findByCourseName = function(course, callback){
	console.log(course);
	Document.find({_course: course}, function(err, documents){
		if(err) return console.log(err);
		console.log('Finding documents by course name.');
		callback(documents);
	});
}