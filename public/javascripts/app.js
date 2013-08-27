
var app = app || {};

// Router

app.Router = Backbone.Router.extend({
	routes: {
		'' : 'home',
		'search/:query': 'search',
		'upload':'upload'
	},

	home: function(){
		console.log('home')
	},

	search: function(query){
		$("#search-form input").val(query);
		app.searchNav.searchHandler();
	},

	upload: function(){
		$('#upload-modal').modal();
	}
});

// Utilities

app.TemplateCache = {
    get: function(selector){
      if (!this.templates){ this.templates = {}; }

      var template = this.templates[selector];
      if (!template){
        var tmpl = $(selector).html();
        template = _.template(tmpl);
        this.templates[selector] = template;
      }
      return template;
    }
  }

// Home 

app.HomeView = Backbone.View.extend({
	className: 'home',

	template: '#home-template',

	render: function(){
		var template = app.TemplateCache.get(this.template);
		this.$el.html(template());
		return this.$el;
	}
});

// Forms

app.UploadModal = Backbone.View.extend({
	el: '#upload-modal',

	events: {
		"click button#upload-all": "uploadHandler",
		"click #add-upload-item": "addUploadItem"
	},

	uploadHandler: function(event){
		Backbone.trigger('submit-uploads');
	},

	setCourse: function(view){
		this.view = view;
		this.itemArray = new Array();
		$('#upload-items-container').html('');
		this.addUploadItem();
	},

	addUploadItem: function(){
		this.itemArray.push(new app.UploadItem({view: this.view }))
		$('#upload-items-container').append(this.itemArray[this.itemArray.length - 1].render());
	}
});

app.UploadItem = Backbone.View.extend({
	className: 'upload-item',
	template: '#upload-item-template',

	initialize: function(){
		Backbone.on('submit-uploads', this.upload, this);
		this.view = this.options.view;
		this.model = this.options.view.model;
	},

	render: function(){
		var template = app.TemplateCache.get(this.template);
		this.$el.html(template(this.model.attributes));
		this.$('.form-control.course').val(this.model.attributes._id);
		return this.$el;
	},


	uploadProgress: function(event){
		console.log('hi')
		if (event.lengthComputable) {
		      var percentComplete = Math.round(event.loaded * 100 / event.total);
		      this.$('.progress-bar').css('width', percentComplete.toString() + '%' );
		}
	},

	uploadComplete: function(data, status, xhr){
		this.view.getDocuments();
		this.$el.html("<div class='well well-sm'><center><h5 style='color: #749131;'>Done!</h5></center></div>");
	},

	upload: function(){
		var self = this;
		$("#progress-bar-group").css('display', 'block');

		var file = this.$('.fileupload')[0].files[0];
		var course = this.$('.form-control.course').val();
		var name = this.$('.form-control.name').val();
		var school = this.model.get('_school');
		var key = school + '/' + course + '/' + file.name;
		var fd1 = new FormData();
		fd1.append('key', key);
		fd1.append('school', school);
		fd1.append('course', course);
		fd1.append('name', name);
		$.ajax({
		type: "POST",
		url: '/api/upload',
		processData: false,
		contentType: false,
		data: fd1,
		success: function(data, status, xhr){
			var fd2 = new FormData();
			fd2.append('key', key);
			fd2.append('acl', 'public-read');
			fd2.append('AWSAccessKeyId', 'AKIAI4L23ZQPPVRPBPDQ');
			fd2.append('Content-Type', file.type);  
			fd2.append('policy', data.policy);
			fd2.append('signature', data.signature);
			fd2.append('file', file);

			$.ajax({

				xhr: function(){

					var xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener("progress", function(event){
						self.uploadProgress(event);
					});
					return xhr;
				},


				type: 'POST',
				url: 'https://docgoose.s3.amazonaws.com/',
				data: fd2,
				processData: false,
				contentType: false,
				success: function(data, status, xhr){
					self.uploadComplete();
				}
			});
		}
	});
	}


});

app.SearchNav = Backbone.View.extend({
	el: "#search-nav",

	 events: {
      "keyup input": "searchHandler",
      "click a": "modalHandler"
    },

	searchHandler: function(event){
		Backbone.trigger('search', event, $("#search-form input").val());
    },

    modalHandler: function(event){
    	app.uploadModal.setCourse(this.model);
    	$('#upload-modal').modal();
    }
});

// Courses

app.Course = Backbone.Model.extend({});

app.CourseList = Backbone.Collection.extend({
	model: app.Course,

	initialize: function(){
		this.once('reset', function(){
			this.original = this.models;
			app.homeView = new app.HomeView();
			app.courseListView = new app.CourseListView();
			app.searchNav = new app.SearchNav();
			app.uploadModal = new app.UploadModal();
			app.router = new app.Router();
			Backbone.history.start();
		}, this);
	}
});

app.CourseView = Backbone.View.extend({
	className: 'course',
	template: '#course-template',

	events: {
		"click .course-name": "getDocuments",
		"click .course-status": "getDocuments",
		"click .course-upload": "upload"
	},

	render: function(){
		var template = app.TemplateCache.get(this.template);
		this.$el.html(template(this.model.attributes));
		return this.$el;
	},

	getDocuments: function(){
		this.documentListView = new app.DocumentListView({_id: this.model.attributes._id});
		Backbone.on('loaded-documents', function(){
			this.$('.course-documents').html(this.documentListView.$el).hide().fadeIn();
			this.$('course-status').hide().fadeIn();
		}, this);
		document.location.hash = "/search/" +  $("#search-form input").val();
		this.$('.course-status').addClass('tabbed');

		
	},

	upload: function(){
		app.uploadModal.setCourse(this);
		$('#upload-modal').modal();
	}
});

app.CourseListView = Backbone.View.extend({
	el: "#main-content",

	initialize: function(){
		this.collection = app.courseList; //bootstrapped data
		this.render();
		Backbone.on('search', this.searchClasses, this);
	},

	render: function(){
		if(this.collection.models.length > 500){
			this.$el.html(app.homeView.render());
		} else {
			var container = [];
			_.each(this.collection.models, function(course){
				container.push(this.renderCourse(course));
			}, this);
		}
			this.$el.html(container);

	},

	renderCourse: function(course){
		var courseView = new app.CourseView({
			model: course
		});
		return courseView.render();
	},

	searchClasses: function(event, query){
		var stringSplit = query.split(' ');
		var queryRegExp = new RegExp(query, "gi");
    var split = _.map(stringSplit, function(word){
          return new RegExp(word, "gi")
        })
        var searched = _.filter(this.collection.original, function(course){
          for(var i = 0; i < split.length; i++){
          	if(queryRegExp.test(course.get('departmentCode') + ' ' + course.get('courseNumber'))) return true;
          	if(split[i].test(course.get('departmentCode'))){
          		for(var n = 0; n < split.length; n++){
          			 if(!split[n].test(course.get('title')) && i != n && stringSplit[i] != "") return false;
          	} 
          } else {

           if(!split[i].test(course.get('title')) && stringSplit[i] != '') return false;
         }
        }
          return true;
        });
        this.collection.reset(searched);
        this.render();

	}
});

// Documents

app.Document = Backbone.Model.extend({});

app.DocumentList = Backbone.Collection.extend({
	model: app.Document,

	initialize: function(_id){
		this._id = _id;
	},

	url: function(){
		return '/api/course/' + this._id;
	}
});

app.DocumentView = Backbone.View.extend({
	className: 'document clearfix',
	template: '#document-template',

	render: function(){
		var template = app.TemplateCache.get(this.template);
		console.log(this.model)
		this.$el.html(template(this.model.attributes));
		return this.$el;
	}

});

app.DocumentListView = Backbone.View.extend({
	className: 'document-list',

	initialize: function(){
		var self = this;
		console.log(this.options._id)
		this.collection = new app.DocumentList(this.options._id);
		this.collection.fetch({
			success: function(response, xhr){
			 	self.render();
			 	Backbone.trigger('loaded-documents');
			}
		});
	},

	render: function(){
		var container = new Array();
		_.each(this.collection.models, function(document){
			container.push(this.renderDocument(document));
		}, this);
		this.$el.html(container);
	},

	renderDocument: function(document){
		console.log(document)
		var documentView = new app.DocumentView({
			model: document
		});

		return documentView.render();
	}
});