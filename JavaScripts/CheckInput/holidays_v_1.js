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


/*
$(document).ready(function(){
	$('body').on('input', "[id^='Employee_']", function () {
		newValue = $.parseJSON($("input[id^='Employee_']").val());
        $("input[id^='Title_']").val(newValue[0].DisplayText);
    });
});
*/

