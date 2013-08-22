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
secureApp.set('port', 443);
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
app.get('/about', routes.about);
app.get('/:name', routes.school);
app.get('/:name/about', routes.about);
app.get('/api/school/:name', routes.getSchoolJSON);  // human readable
app.get('/api/class/:class-id', routes.getClassJSON);  // class id
app.get('/api/upload/', routes.uploadForm);
app.post('/api/upload/', routes.upload);
secureApp.get('/api/admin', auth, routes.admin);

var options = {
	key: fs.readFileSync('./adminPageKey.pem'),
	cert: fs.readFileSync('./cert.pem')
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('HTTP express server listening on port ' + app.get('port'));
});

http.createServer(secureApp).listen(secureApp.get('port'), function(){
  console.log('HTTPS express server listening on port ' + secureApp.get('port'));
});




