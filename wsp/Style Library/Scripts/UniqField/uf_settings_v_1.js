var busy = false;
var rf_listId = '';
var delayTime = 2000;

(function () {
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		//"FieldName": {
			//	NewForm: <function_name>
			//	EditForm: <function_name>
			//},
		"Title": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
		},
	};
	
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();