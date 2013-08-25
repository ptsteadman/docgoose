var mongoose = require('mongoose');
var async = require('async');
var Course = mongoose.model('Course');

exports.reset = function(school, callback){

	var saveCourse = function(courseJSON, callback){
		var course = new Course({
			_id: courseJSON.title,
			title: courseJSON.title,
			departmentCode: courseJSON.departmentCode,
			courseNumber: courseJSON.courseNumber,
			numberOfDocs: courseJSON.numberOfDocs,
			_school: school
		});
		course.save(function(err){
        if(!err){
        	console.log(courseJSON.name + ' saved');
        	callback();
        } else {
            return console.log(err);
        }
    });
	}

	var courses = require('../JSON/course_lists/' + school + '.json');

	
	async.each(courses, saveCourse, function(err){
		if (err) return console.log(err);
		console.log(school +' courses reset from JSON.');
		callback();
	});
	
}

exports.findAll = function(callback){
	Course.find({}, function(err, courses){
		if(err) return console.log(err);
		console.log('Finding all courses.');
		callback(courses);
	});
}

exports.findBySchoolName = function(school, callback){
	Course.find({_school: school}, function(err, courses){
		if(err) return console.log(err);
		console.log('Finding courses by school name.');
		callback(courses);
	});
}