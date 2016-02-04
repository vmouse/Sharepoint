_spBodyOnLoadFunctionNames.push("InitializeScripts");

function InitializeScripts() {
    SP.SOD.executeFunc('clientpeoplepicker.js', 'SPClientPeoplePicker', initUserPicker);
}

function initUserPicker() {
	var pickerDiv = $("[id$='ClientPeoplePicker'][title='Employee']");
	var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[pickerDiv[0].id];

	peoplePicker.OnUserResolvedClientScript=function() {
		newValue = peoplePicker.GetAllUserInfo();
		if (newValue.length === 1) {
	        $("input[id^='Title_']").val(newValue[0].DisplayText);
	        $("input[id^='email_']").val(newValue[0].EntityData['Email']);
	    } else {
	    	$("input[id^='Title_']").val('');
	        $("input[id^='email_']").val('');
	    }
	}
}

function parseDate(dateString) {
	var date = dateString.split(".");
	var temp = date[2] + "-" + date[1] + "-" + date[0];
	return new Date(temp);
}

function dateDiff(date1, date2) {
	var diff = parseDate(date1) - parseDate(date2);
	return Math.floor( diff / 86400000)+1;
}

function OnPickerFinish(resultfield)
{
	if (resultfield != null)
		if (typeof resultfield.ondatepickerclose != "undefined" && Boolean(resultfield.ondatepickerclose))
			if (typeof resultfield.ondatepickerclose == "function") resultfield.ondatepickerclose();
			else eval(resultfield.ondatepickerclose);
	clickDatePicker(null, "", "", null)

	var sd = $("input[id^='StopDate_']").val();
	if (sd == "") {
		$("input[id^='StopDate_']").val($("input[id^='StartDate_']").val());
	}

	$("input[id^='Days_']").val(dateDiff($("input[id^='StopDate_']").val(), $("input[id^='StartDate_']").val()));
}

$(document).ready(function(){
	$('body').on('input', "[id^='StartDate_']", function () {
		var sd = $("input[id^='StopDate_']").val();
		if (sd == "") {
			$("input[id^='StopDate_']").val($("input[id^='StartDate_']").val());
		}
	});

	$('body').on('input', "[id^='StopDate_'],[id^='StartDate_']", function () {
		$("input[id^='Days_']").val(dateDiff($("input[id^='StopDate_']").val(), $("input[id^='StartDate_']").val()));
	});

//	var dpDiv = $("[id$='DateTimeFieldDate'][title='StartDate']");
//	dpDiv.onchange=function() {
//		$("input[id^='StopDate_']").val($("input[id^='StartDate_']").val());
//	}
//	var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[pickerDiv[0].id];

});


/*
$(document).ready(function(){
	$('body').on('input', "[id^='Employee_']", function () {
		newValue = $.parseJSON($("input[id^='Employee_']").val());
        $("input[id^='Title_']").val(newValue[0].DisplayText);
    });
});
*/

