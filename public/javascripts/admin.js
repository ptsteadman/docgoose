$(document).ready(function(){
	$('#initialize-schools').click(function(){
		$.ajax({
			type: "POST",
			url: '../api/resetSchools',
			success: function(){ console.log('Done.') }
		});
	});

	$('#initialize-courses').click(function(){
		$.ajax({
			type: "POST",
			url: '../api/resetCourses/cornell',
			success: function(){ console.log('Done.') }
		});
	});

});