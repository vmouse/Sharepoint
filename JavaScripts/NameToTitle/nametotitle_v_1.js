$(document).ready(function(){
	$('body').on('input', "[id^='FileLeafRef_']", function (a,b,c) {
        newValue = $(this).val();
        
        if($("input[id^='Title_']").val() == '' || $(this).data('oldValue') === undefined || ($(this).data('oldValue') == $("input[id^='Title_']").val())){
        	$("input[id^='Title_']").val(newValue);
        }
        $(this).data('oldValue', newValue);
    });
    if($("input[id^='Title_']").val()==""){
    	$("input[id^='Title_']").val($("input[id^='FileLeafRef_']").val());
    }
});