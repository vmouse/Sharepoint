(function () {
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		//"FieldName": {
			//	NewForm: <function_name>
			//	EditForm: <function_name>
			//},
		"Code0": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
		},
	};
	
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();