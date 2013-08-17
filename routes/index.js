exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.school = function(req, res){
	var school = req.params.name;
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


