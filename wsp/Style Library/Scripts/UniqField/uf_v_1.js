function renderRequiredField(ctx) {
  var inputCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
  rf_listId = inputCtx.listAttributes.Id;  
  
  var validators = new SPClientForms.ClientValidation.ValidatorSet();
  validators.RegisterValidator(new validateInput());
  inputCtx.registerValidationErrorCallback(inputCtx.fieldName, validateInput);
  inputCtx.registerClientValidator(inputCtx.fieldName, validators); 
  
  jQuery('body').on('input', "[id^='" + inputCtx.fieldName + "']", function () {
	  jQuery("[id^='Error_" + inputCtx.fieldName + "']").remove();
	  setTimeout(function() {
		if(!busy) {
			busy = true;
			
			var value = jQuery("[id^='" + inputCtx.fieldName + "']").val();
			if(value == '')
				return;

			var erEl = jQuery("[id^='" + inputCtx.fieldName + "']").closest('span');
			if(CheckValue(inputCtx.fieldName, value)) {
				if(erEl.find('span[id^="Error_"]').length == 0)
					erEl.append('<span id="Error_' + inputCtx.fieldName + '" class="ms-formvalidation ms-csrformvalidation"><span role="alert">Значение не уникально. Пожалуйста, повторите ввод</span></span>');
			}
	    }
	  }, delayTime);
  });
  
  var html = '';
  switch (ctx.CurrentFieldSchema.FieldType) {
        case "Text":
        case "Number":
        case "Integer":
        case "Currency":
        
        case "Computed":
            html = SPFieldText_Edit(ctx);
			break;
		case "Choice":
            html = SPFieldChoice_Edit(ctx);
			break;
        case "MultiChoice":
            prepareMultiChoiceFieldValue(ctx);
            html = SPFieldMultiChoice_Edit(ctx);
			break;
        case "Boolean":
            html = SPFieldBoolean_Edit(ctx);
			break;
        case "Note":
            prepareNoteFieldValue(ctx);
            html = SPFieldNote_Edit(ctx);
			break;
        case "File":
            html = SPFieldFile_Edit(ctx);
			break;
        case "Lookup":
        case "LookupMulti":
            html = SPFieldLookup_Edit(ctx);           
			break;
        case "URL":
            html = SPFieldUrl_Edit(ctx);
			break;
        case "User":
            prepareUserFieldValue(ctx);
            html = SPFieldUser_Edit(ctx);
			break;
        case "UserMulti":
            prepareUserFieldValue(ctx);
            html = SPFieldUserMulti_Edit(ctx);
			break;
        case "DateTime":
            html = SPFieldDateTime_Edit(ctx);
			break;
        case "Attachments":
            html = SPFieldAttachments_Default(ctx);
			break;
        case "TaxonomyFieldType":
            //Re-use ready sharepoint inside sp.ui.taxonomy.js javascript libraries
            html = SP.UI.Taxonomy.TaxonomyFieldTemplate.renderDisplayControl(ctx);
    }
    return (jQuery(html).append('<span id="Error_' + inputCtx.fieldName + '" class="ms-formvalidation ms-csrformvalidation" style="display: none;"></span>'))[0].outerHTML;
}

function validateInput() { 
    validateInput.prototype.Validate = function (value) {
    	try {
    		var field = this.Validate.caller.caller.arguments[0];
   		 	if((!value || value == '') || field == '')
		    	return new SPClientForms.ClientValidation.ValidationResult(false, '');
	    
			var isError = CheckValue(field, value),
				errorMessage = '';
        	if(isError)
        		errorMessage = 'Значение не уникально. Пожалуйста, повторите ввод';

        	return new SPClientForms.ClientValidation.ValidationResult(isError, errorMessage);
        }
		catch(exp) {
			console.log(exp);
			return new SPClientForms.ClientValidation.ValidationResult(false, '');
		} 
    }; 
};

function CheckValue(field, value) {
	var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + rf_listId + "')/items" +
	    			"?$select=ID" +
	    			"&$filter=" + field + "%20eq%20'" + encodeURI(value.toLowerCase()) + "\'";
   	console.log(url);
   	
	var isError = false;
	jQuery.ajax({
		cache: false,
		url: url,
		type: 'GET',
		dataType: 'json',
		async: false,
		headers: {
			"accept": "application/json;odata=verbose;charset=utf-8"
		},
		success: function (response) {
			if(response.d.results.length == 1) {
				var currentId = getParameterByName('ID');
				if(currentId != '' && response.d.results[0].ID == currentId)
					isError = false;
				else
					isError = true;
			}
			else if(response.d.results.length > 1)
				isError = true;
			else
				isError = false;
					
			setTimeout(function() { busy = false; }, delayTime / 2);
		},
		error: function ajaxError(response) {
			setTimeout(function() { busy = false; }, delayTime / 2);
			alert(response.status + ' ' + response.statusText);
			return false;
		},
	});
	return isError;
}

//--------------------------------------------------------------
//User control need specific formatted value to render content correctly
function prepareUserFieldValue(ctx) {
    var item = ctx['CurrentItem'];
    var userField = item[ctx.CurrentFieldSchema.Name];
    var fieldValue = "";

    for (var i = 0; i < userField.length; i++) {
        fieldValue += userField[i].EntityData.SPUserID + SPClientTemplates.Utility.UserLookupDelimitString + userField[i].DisplayText;

        if ((i + 1) != userField.length) {
            fieldValue += SPClientTemplates.Utility.UserLookupDelimitString
        }
    }

    ctx["CurrentFieldValue"] = fieldValue;
}

//Choice control need specific formatted value to render content correctly
function prepareMultiChoiceFieldValue(ctx) {

    if (ctx["CurrentFieldValue"]) {
        var fieldValue = ctx["CurrentFieldValue"];

        var find = ';#';
        var regExpObj = new RegExp(find, 'g');

        fieldValue = fieldValue.replace(regExpObj, '; ');
        fieldValue = fieldValue.replace(/^; /g, '');
        fieldValue = fieldValue.replace(/; jQuery/g, '');

        ctx["CurrentFieldValue"] = fieldValue;
    }
}

//Note control need specific formatted value to render content correctly
function prepareNoteFieldValue(ctx) {

    if (ctx["CurrentFieldValue"]) {
        var fieldValue = ctx["CurrentFieldValue"];
        fieldValue = "<div>" + fieldValue.replace(/\n/g, '<br />'); + "</div>";

        ctx["CurrentFieldValue"] = fieldValue;
    }
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.href);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}