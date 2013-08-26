var express = require('express')
  , db = require('./mongo/mothergoose')
  , routes = require('./routes')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs');

var app = express();
var secureApp = express();

// all environments for HTTPS
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
var ejs = require('ejs'); 
ejs.open = '<@'; ejs.close = '@>';
app.use(express.favicon(path.join( __dirname, '/public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
var auth = express.basicAuth('docgoose', 'pclnsux');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// all environments for HTTPS
secureApp.set('port', process.env.PORT || 3443);
secureApp.set('views', __dirname + '/views');
secureApp.set('view engine', 'ejs');
secureApp.use(express.favicon(path.join( __dirname, '/public/images/favicon.ico')));
secureApp.use(express.logger('dev'));
secureApp.use(express.bodyParser());
secureApp.use(express.methodOverride());
secureApp.use(app.router);
secureApp.use(require('less-middleware')({ src: __dirname + '/public' }));
secureApp.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == secureApp.get('env')) {
  secureApp.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/:name', routes.school);
app.get('/api/school/:name', routes.getSchoolJSON);  // human readable
app.get('/api/course/:courseId', routes.getCourseJSON);  // class id
app.post('/api/upload', routes.upload);
app.get('/api/admin', auth, routes.admin);

app.post('/api/resetschools', routes.resetSchools);  // TODO: secure
app.post('/api/resetcourses/:name', routes.resetCourses);  // TODO: secure 
app.get('/api/admin', auth, routes.admin); 

/*
var options = {
	key: fs.readFileSync('./adminPageKey.pem'),
	cert: fs.readFileSync('./cert.pem')
}
*/
//5ce1e4526d472deb88ef1f72aa4162ce13bdaf43

http.createServer(app).listen(app.get('port'), function(){
  console.log('HTTP express server listening on port ' + app.get('port'));
});

// http.createServer(secureApp).listen(secureApp.get('port'), function(){
  // console.log('HTTPS express server listening on port ' + secureApp.get('port'));
// });




