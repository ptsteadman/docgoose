var motherGoose = require('./mothergoose');
var geoip = require('geoip-lite');
var AWS = require('aws-sdk');
var awsUploader = require('./awsUploader');
var format = require('util').format;
var fs = require('fs');
var distanceSorter = require('../util/distanceSorter');
var schools = require('../JSON/schools.json');

exports.index = function (req, res) {
    //get IP address and send to correct school
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    var location = geoip.lookup(ip);
	if (location) {
	    //distanceSorter.sortSchoolsByDistanceFrom(schools,46,-74); //test...should return McGill
		distanceSorter.sortSchoolsByDistanceFrom(schools,location.ll[0],location.ll[1]);
		console.log(location);	
		res.redirect('/' + schools[0].name);
	} else {
		res.redirect('/cornell'); //default if location can not be found
	}	
};

exports.school = function (req, res) {
    var school = req.params.name;
    console.log(school);
    res.render('index', {
        title: school		
    })
};

exports.about = function(req, res) {
	var school = req.params.name;
	console.log(school);
	res.render('index', {
		title: school
	})
};

exports.getClassJSON = function (req, res) {
    res.render('index', {
        title: 'getClassJson'
    });
};

exports.getSchoolJSON = function (req, res) {
    res.render('index', {
        title: 'getSchoolJson'
    });
};

exports.uploadForm = function (req, res) {
    res.send('<form method="post" enctype="multipart/form-data">' + '<p>File Name: <input type="text" name="title" /></p>' + '<p>File: <input type="file" name="file" /></p>' + '<p><input type="submit" value="Upload" /></p>' + '</form>');
}

exports.upload = function (req, res) {
	awsUploader.uploadFile(req);
    //res.render('index', { title: 'upload' });
    res.send(format('\nuploaded %s (%d Kb) to %s as %s', req.files.file.name, req.files.file.size / 1024 | 0, req.files.file.path, req.body.title));

};