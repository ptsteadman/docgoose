
var app = app || {};

app.SearchForm = Backbone.View.extend({
	el: "#search-form",

	 events: {
      "keyup input": "searchHandler"
    },

	searchHandler: function(event){
		Backbone.trigger('search', event, $("#search-form input").val());
    }
})

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
			this.original = this.models
			app.courseListView = new app.CourseListView();
			app.searchForm = new app.SearchForm();
		}, this);
	}
});



app.CourseView = Backbone.View.extend({
	className: 'course',
	template: _.template($('#course-template').html()),

	render: function(){
		this.$el.html(this.template(this.model.attributes));
		return this.$el;
	}
	
});

app.CourseListView = Backbone.View.extend({
	el: "#main-content",

	searchClasses: function(event, query){
		var split = query.split(' ');
        split = _.map(split, function(word){
          return new RegExp(word, "gi")
        })
        console.log(split)
        var searched = _.filter(this.collection.original, function(course){
          for(var i = 0; i < split.length; i++){
            if(!split[i].test(course.get('title'))){
              return false;
            }
          }
          return true;
        });
        this.collection.reset(searched);
        this.render();

	},

	initialize: function(){
		this.collection = app.courseList; //bootstrapped data
		this.render();
		Backbone.on('search', this.searchClasses, this);
	},

	render: function(){
		if(this.collection.models.length > 500){
			console.log('too big')
			this.$el.html('<h1>Start Typing!</h1>')
		} else {
			this.$el.html('');
			var self = this;
			_.each(this.collection.models, function(course){
				self.renderCourse(course)
			});
		}

	},

	renderCourse: function(course){
		var courseView = new app.CourseView({
			model: course
		});

		this.$el.append(courseView.render());
	}
});

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