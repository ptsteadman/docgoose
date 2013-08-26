var geoip = require('geoip-lite');
var async = require('async');
var awsUploader = require('../util/awsUploader');
var format = require('util').format;
var distanceSorter = require('../util/distanceSorter');
var schools = require('../JSON/schools.json');
var school = require('../mongo/school');  // school model
var course = require('../mongo/course');  // course model
var document = require('../mongo/document'); // document model
var crypto = require('crypto');

exports.index = function (req, res) {
    //get IP address and send to correct school
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var location = geoip.lookup(ip);
	if (location) {
	    //distanceSorter.sortSchoolsByDistanceFrom(schools,46,-74); //test...should return McGill
		distanceSorter.sortSchoolsByDistanceFrom(schools,location.ll[0],location.ll[1]);
		console.log(location);	
		res.redirect('/' + schools[0].name);
	} else {
		res.redirect('/cornell/'); //default if location can not be found
	}	
};

exports.school = function (req, res) {
  var schoolToGet = req.params.name;
  school.findAll(function(schoolsFromMongo){
    async.filter(schoolsFromMongo, function(school, callback){
        if (school.name == schoolToGet){ callback(true); } else {
            callback(false);
        }
    }, function(theSchool){
        course.findBySchoolName(schoolToGet, function(coursesFromMongo){
          res.render('index', {
            school: theSchool[0],
            schoolList: schoolsFromMongo,
            courseList: coursesFromMongo       
          });
        });
    });
  });
}


exports.getCourseJSON = function (req, res) {
    console.log(req.params.courseId)
    document.findByCourseName(req.params.courseId, function(data){
        res.json(data);
    })
};

exports.getSchoolJSON = function (req, res) {
    res.render('index', {
        title: 'getSchoolJson'
    });
};

exports.upload = function (req, res) {

    document.createDocument(req.body, function(){
        console.log('Document Saved:' + req.body.key);
    })

    //TODO: make this secure

    POLICY_JSON = { "expiration": "2020-12-01T12:00:00.000Z",
            "conditions": [
            {"bucket": 'docgoose'},
            ["starts-with", "$key", ""],
            {"acl": 'public-read'},                           
            ["starts-with", "$Content-Type", ""],
            ["content-length-range", 0, 524288000]
            ]
          };


    var secret = 'utjjHYg7i5VqzOJ5tFB8BVc2TQdAlAP5ABNFY0x5';
    var policyBase64 = new Buffer(JSON.stringify(POLICY_JSON)).toString('base64');
    var signature = crypto.createHmac("sha1", secret).update(policyBase64).digest("base64")
    var result = {
        policy: policyBase64,
        signature: signature
    }

    res.json(result);
};

exports.admin = function (req, res) {
    res.render('admin', {
        title: 'Sup'
    });
}

exports.resetSchools = function (req, res) {
    school.reset(function(){
        res.send(200);
    });
}
exports.resetCourses = function (req, res) {
	  var schoolToGet = req.params.name;
    course.reset(schoolToGet, function(){
        res.send(200);
    })

}