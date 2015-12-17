$(document).ready(function(){
	$('body').on('input', "[id^='StartDate_']", function () {
		var sd = $("input[id^='StopDate_']").val();
		if (sd == null) {
			$("input[id^='StopDate_']").val(sd);
		}
    });
});


