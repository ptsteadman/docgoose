var app = app || {};

app.CourseList = Backbone.Collection.extend({
	model: app.Course,

	initialize: function(){
		console.log('CourseData');
	}
});

app.Course = Backbone.Model.extend({});

app.CourseView = Backbone.View.extend({
	
});

app.CourseListView = Backbone.View.extend({
	
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