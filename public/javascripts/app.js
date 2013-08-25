
var app = app || {};

// Router

app.Router = Backbone.Router.extend({
	routes: {
		'' : 'home',
		'search/:query': 'search',
		'/cornell': 'cornellnoslash'
	},

	home: function(){
		console.log('home')
	},

	search: function(query){
		$("#search-form input").val(query);
		app.searchNav.searchHandler();
	},

	cornellnoslash: function(){
		console.log('cornell-no-slash')
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
    	console.log('modal')
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
			app.router = new app.Router();
			Backbone.history.start();
		}, this);
	}
});

app.CourseView = Backbone.View.extend({
	className: 'course',
	template: '#course-template',

	events: {
		"click": "getDocuments"
	},

	render: function(){
		var template = app.TemplateCache.get(this.template);
		this.$el.html(template(this.model.attributes));
		return this.$el;
	},

	getDocuments: function(){
		this.documentListView = new app.DocumentListView(this.model.attributes._id);
		document.location.hash = "/search/" +  $("#search-form input").val();
		this.$el.animate({height: '500px'}, 500);
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

app.DocumentView = Backbone.Collection.extend({

});

app.DocumentListView = Backbone.Collection.extend({
	className: 'document-list',

	initialize: function(_id){
		this.documentList = new app.DocumentList(_id);
		this.documentList.fetch({
			success: function(response, xhr){
				console.log('success');
				console.log(response);
			}
		});
	}
});