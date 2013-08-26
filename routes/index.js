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
var momemt = require('moment');
var AWS = require('aws-sdk');

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
    res.send(200);
};

exports.getSchoolJSON = function (req, res) {
    res.render('index', {
        title: 'getSchoolJson'
    });
};

exports.upload = function (req, res) {

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
    console.log(signature);
    var result = {
        policy: policyBase64,
        signature: signature
    }

    res.json(result);



    /*
    AWS.config.update({accessKeyId: 'AKIAI4L23ZQPPVRPBPDQ', secretAccessKey: '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', region: "us-west-2"});
    var s3 = new AWS.S3(); 
    var params = {Bucket: 'docgoose', Key: 'Capture.PNG'};
    var url = s3.getSignedUrl('putObject', params);
    console.log("The URL is", url);

    var result = {
        signed_request: url,
        url: "https://s3-us-west-2.amazonaws.com/docgoose/Capture"
    }

    res.json(result);
    */
/*
    var signature = function(policy){
        return crypto.createHmac('sha1', 'YpHQ7bnEPFJR2dUngJ0xfTw7BHx/FbHsPh23xmyq').update(policy).digest('base64'); 
    }

    var policy = function(){
        var s3Policy = {
            expiration: moment.utc().add('minutes', 30).format('YYYY-MM-DDTHH:mm:ss\\Z'),
            conditions: [
                { bucket: 'docgoose'},
                { acl: 'public-read-write'},
                { success_action_status: '201'},
                ['starts-with', '$key', ''],
                ['starts-with', '$Content-Type', 'image/']
            ]
        }

        return new Buffer(JSON.stringify(s3Policy)).toString('base64');
    }

    var p = policy();
    var s = signature(p);

    res.render('index', {
        signature: s,
        policy: p,
        uid: uuid.v1(),
        aws_key: 'AKIAJVXQUGSA5JUW7XUQ',
        aws_bucket: 'docgoose'
    });


    document.createDocument(req, function(){
        res.send(200);
    });
*/
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