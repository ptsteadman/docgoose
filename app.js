var express = require('express')
  , db = require('./mongo/mothergoose')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
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

app.get('/', routes.index);
app.get('/:name', routes.school);
app.get('/api/school/:name', routes.getSchoolJSON);  // human readable
app.get('/api/class/:class-id', routes.getClassJSON);  // class id
app.get('/api/upload/', routes.uploadForm);
app.post('/api/upload/', routes.upload);
app.get('/api/admin', auth, routes.admin);
app.post('/api/resetschools', routes.resetSchools);  // TODO: secure
app.post('/api/resetcourses/:name', routes.resetCourses);  // TODO: secure 

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
