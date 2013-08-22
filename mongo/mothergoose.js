var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Connect to MongoDB

mongoose.connect('mongodb://localhost/mothergoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connected to the mothergoose.')
});

// Define Schema once, for use elsewhere in the app

var schoolSchema = new Schema({
	_id: Number,
	name: String,
	location: String,
	courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

var courseSchema = new Schema({
	_id: Number,
	title: String,
	departmentCode: String,
	courseNumber: String,
	numberOfDocs: Number,
	documents: [{ type: Schema.Types.ObjectId, ref: 'Document'}],
	_school: { type: Number, ref: 'School' } 
});

var documentSchema = new Schema({
	_id: Number,
	name: String,
	link: String,
	_course: { type: Number, ref: 'Course' } 
})

var School = mongoose.model('School', schoolSchema);
var Course = mongoose.model('Course', courseSchema);
var Document = mongoose.model('Document', documentSchema);
