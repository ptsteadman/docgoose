
var app = app || {};

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

app.SearchForm = Backbone.View.extend({
	el: "#search-form",

	 events: {
      "keyup input": "searchHandler"
    },

	searchHandler: function(event){
		Backbone.trigger('search', event, $("#search-form input").val());
    }
});

// Courses

app.Course = Backbone.Model.extend({
	initialize: function(){

	},
	parse: function(data){
		console.log('hi');
	}	
});

app.CourseList = Backbone.Collection.extend({
	model: app.Course,

	initialize: function(){
		this.once('reset', function(){
			this.original = this.models;
			app.homeView = new app.HomeView();
			app.courseListView = new app.CourseListView();
			app.searchForm = new app.SearchForm();
		}, this);
	}
});

app.CourseView = Backbone.View.extend({
	className: 'course',
	template: '#course-template',

	render: function(){
		var template = app.TemplateCache.get(this.template);
		this.$el.html(template(this.model.attributes));
		return this.$el;
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
		console.log(stringSplit)
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

$(function(){

	// MODAL CODE, needs to be Backboned
	  var regex = /(\.txt|\.pdf|\.doc|\.docx|\.tex|\.java|\.c|\.s|\.tex|\.xls|\.p|\.f|\.nsf|\.pptx|\.sxi|\.sxc)$/i;

            $(function() {
                $('a[rel*=leanModal]').leanModal({
                    closeButton: ".modal_close"
                });
            });

            function checkFile() {
                var fup = document.getElementById('fileField');
                var fileName = fup.value;
                if (!regex.test(fileName)) {
                    $('#fileField').css('background-color', '#FDE0E0');
                    $('#file_support').show();
                    return false;
                }
                return true;
            }

            $("#fileField").change(function() {
                var thisField = $("#fileField");
                if (!regex.test(this.value)) {
                    thisField.css('background-color', '#FDE0E0');
                    $('#file_support').show();
                } else {
                    thisField.css('background-color', 'white');
                }
            });
})