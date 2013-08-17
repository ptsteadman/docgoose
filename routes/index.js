var motherGoose = require('./mothergoose');
var geoip = require('geoip-lite');

exports.index = function(req, res){
	//get IP address and send to correct school
	var location = geoip.lookup(req.connection.remoteAddress);
	console.log(location);
  res.redirect('/cornell');
};

exports.school = function(req, res){
	var school = req.params.name;
	console.log(school);
	res.render('index', {title: school})
}

exports.getClassJSON = function(req, res){
  res.render('index', { title: 'getClassJson' });
};

exports.getSchoolJSON = function(req, res){
  res.render('index', { title: 'getSchoolJson' });
};

exports.upload = function(req, res){
  res.render('index', { title: 'upload' });
};


