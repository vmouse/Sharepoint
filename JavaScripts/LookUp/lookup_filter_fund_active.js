var listInnerName = "Funds";
var filterField = "FundStatus";
var filterValue = encodeURI("Прочие фонды");
var filterOperation = 'ne';

(function () {
	var renderCtx = {};
    renderCtx.Templates = {};
    renderCtx.Templates.Fields = {
        "Fund": { "NewForm": renderFund, "EditForm": renderFund},
    };
        
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(renderCtx);
})();


function renderFund(ctx){

	var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);

 	 formCtx.registerGetValueCallback(formCtx.fieldName, function () {
        if ($("[id$=" + formCtx.fieldName + "] option:selected").length != 0) {
            var obj = $("[id$=" + formCtx.fieldName + "] option:selected");
            var str = obj.val() + ';#' + obj.text();
            return str;
        }
        else
            return '';
    }); 
    var selectedValue = ctx.CurrentFieldValue;

 	var fieldHtml = '<select ';
    fieldHtml += 'id="' + formCtx.fieldName + '">';    
    fieldHtml += getData(filterField, filterValue, filterOperation, selectedValue);
    fieldHtml += '"</select>';
    return fieldHtml;
}


function getData(filterField, filterValue, filterOperation, selectedValue)
{
	var result1 ="<option value='0'>(None)</option>";
	
	var webUrl = _spPageContextInfo.webAbsoluteUrl;
    
    var listGuid = returnListGuidByInnerName(webUrl, listInnerName);
    
    if( listGuid != "" ){
	    var queryUrl = webUrl + "/_api/web/lists(guid'" + listGuid + "')/items?";
	    queryUrl += "$select=ID,Title&$top=5000";
	    queryUrl += "&$filter=" + filterField + " " + filterOperation + " '" + filterValue + "'";
	  
	    $.ajax({
	        cache: false,
	        url: queryUrl,
	        type: 'GET',
	        dataType: 'json',
	        async: false,
	        headers: {
	            "accept": "application/json;odata=verbose;charset=utf-8",
	            "content-type": "application/json;odata=verbose"
	        },
	        success: function (response) {
	            $.each(response.d.results, function (i, result) {
	            if(selectedValue==result["ID"]+";#"+result["Title"])
	                result1 += "<option selected value='" + result["ID"] + "'>" + result["Title"] + "</option>";	           
	           	else	 
	                result1 += "<option value='" + result["ID"] + "'>" + result["Title"] + "</option>";
	        	});
	          }, 
	        error: function ajaxError(responseErr) {
	            alert(responseErr.responseText);
	        },
	    }); 
    }
    return result1;
}

function returnListGuidByInnerName(webUrl, listName) {
	var queryUrl = webUrl  + "/_api/web/lists?$expand=RootFolder&$select=ID&$filter=RootFolder/Name%20eq%20%27" + listName + "%27";
	
 	var listId = '';
	
	 $.ajax({
        cache: false,
        url: queryUrl,
        type: 'GET',
        dataType: 'json',
        async: false,
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (response) {
            if (response.d.results.length != 0)
	            listId = response.d.results[0].Id
        },
        error: function (responseErr) {
            alert(responseErr.responseText);
        }
    });
    return listId;
}