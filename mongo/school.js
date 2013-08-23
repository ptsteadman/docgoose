var mongoose = require('mongoose');
var schools = require('../JSON/schools.json');
var async = require('async');
var School = mongoose.model('School');

exports.reset = function(callback){

	var saveSchool =  function(schoolJSON, callback){
		var school = new School({
			name: schoolJSON.name,
			_id: schoolJSON.name,
			latitude: schoolJSON.latitude,
			longitude: schoolJSON.longitude,
			mainColor: schoolJSON.mainColor,
			secondaryColor: schoolJSON.secondaryColor
		});
		school.save(function(err){
        if(!err){
        	console.log(schoolJSON.name + ' saved');
        	callback();
        } else {
            return console.log(err);
        }
    });
	}

	async.each(schools, saveSchool, function(err){
		if (err) return console.log(err);
		console.log('Schools reset from JSON.');
		callback();
	});
}

exports.findAll = function(callback){
	School.find({}, function(err, schools){
		if(err) return console.log(err);
		console.log('Finding all schools');
		callback(schools);
	})
}