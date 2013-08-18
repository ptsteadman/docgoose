var motherGoose = require('./mothergoose');
var geoip = require('geoip-lite');
var AWS = require('aws-sdk');
var awsUploader = require('./awsUploader');
var format = require('util').format;
var fs = require('fs');
var distanceSorter = require('../util/distanceSorter');
var schools = [
    {
        "mainColor": "#b01c2e",
        "secondaryColor": "white",
        "name": "cornell",
        "latitude": 42.4479,
        "longitude": -76.4779
    },
    {
        "mainColor": "white",
        "secondaryColor": "red",
        "name": "mcgill",
        "latitude": 45.5085,
        "longitude": -73.5797
    },
    {
        "mainColor": "#1C2045",
        "secondaryColor": "E7C254",
        "name": "berkeley",
        "latitude": 37.8717,
        "longitude": -122.261
    },
    {
        "mainColor": "#947550",
        "secondaryColor": "black",
        "name": "georgia tech",
        "latitude": 33.7756,
        "longitude": -84.3963
    },
    {
        "mainColor": "#A51C30",
        "secondaryColor": "white",
        "name": "harvard",
        "latitude": 42.3762,
        "longitude": -71.1158
    },
    {
        "mainColor": "#F47F24",
        "secondaryColor": "white",
        "name": "illinois",
        "latitude": 40.0401,
        "longitude": -88.2707
    },
    {
        "mainColor": "#b01c2e",
        "secondaryColor": "white",
        "name": "michigan",
        "latitude": 42.3184,
        "longitude": -83.23
    },
    {
        "mainColor": "#666666",
        "secondaryColor": "#993333",
        "name": "mit",
        "latitude": 42.3584,
        "longitude": -71.0912
    },
    {
        "mainColor": "#682069",
        "secondaryColor": "white",
        "name": "nyu",
        "latitude": 40.7296,
        "longitude": -73.9952
    },
    {
        "mainColor": "#BB0000",
        "secondaryColor": "666666",
        "name": "ohio state",
        "latitude": 40.7976,
        "longitude": -82.5818
    },
    {
        "mainColor": "#000099",
        "secondaryColor": "white",
        "name": "penn state",
        "latitude": 40.7982,
        "longitude": -77.8599
    },
    {
        "mainColor": "#bf910c",
        "secondaryColor": "black",
        "name": "purdue",
        "latitude": 40.4246,
        "longitude": -86.9107
    },
    {
        "mainColor": "#d21034",
        "secondaryColor": "white",
        "name": "rutgers",
        "latitude": 40.501,
        "longitude": -74.4473
    },
    {
        "mainColor": "#8C1515",
        "secondaryColor": "white",
        "name": "stanford",
        "latitude": 37.4278,
        "longitude": -122.1697
    },
    {
        "mainColor": "#cc5500",
        "secondaryColor": "white",
        "name": "texas",
        "latitude": 30.2879,
        "longitude": -97.7278
    },
    {
        "mainColor": "#500000",
        "secondaryColor": "white",
        "name": "texas_a&m",
        "latitude": 30.609,
        "longitude": -96.3492
    },
    {
        "mainColor": "#white",
        "secondaryColor": "#00204E",
        "name": "toronto",
        "latitude": 43.6602,
        "longitude": -79.3943
    },
    {
        "mainColor": "#002145",
        "secondaryColor": "UBC",
        "name": "ubc",
        "latitude": 49.265,
        "longitude": -123.2526
    },
    {
        "mainColor": "#990000",
        "secondaryColor": "#FFCC00",
        "name": "usc",
        "latitude": 34.0223,
        "longitude": -118.2851
    },
    {
        "mainColor": "#660000",
        "secondaryColor": "FF6600",
        "name": "virgina_tech",
        "latitude": 38.8967,
        "longitude": -77.1894
    },
    {
        "mainColor": "white",
        "secondaryColor": "#39275B",
        "name": "washington",
        "latitude": 47.6556,
        "longitude": -122.3091
    },
    {
        "mainColor": "white",
        "secondaryColor": "black",
        "name": "waterloo",
        "latitude": 43.4689,
        "longitude": 80.5472
    },
    {
        "mainColor": "#0f4d92",
        "secondaryColor": "white",
        "name": "yale",
        "latitude": 41.3104,
        "longitude": -72.929
    }
];

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
}

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