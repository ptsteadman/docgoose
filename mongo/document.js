var mongoose = require('mongoose');
var Document = mongoose.model('Document');

exports.createDocument = function(data, callback){
	var document = new Document({
		_id: data.title,
		name: courseJSON.title,
		link: courseJSON.departmentCode,
		_course: data.course
	});
	document.save(function(err){
        if(!err){
        	console.log(courseJSON.name + ' saved');
        	callback();
        } else {
            return console.log(err);
        }
	})
}


exports.findByCourseName = function(course, callback){
	Course.find({_course: course}, function(err, documents){
		if(err) return console.log(err);
		console.log('Finding documents by course name.');
		callback(documents);
	});
}