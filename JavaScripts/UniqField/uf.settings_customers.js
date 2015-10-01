(function () {
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		//"FieldName": {
			//	NewForm: <function_name>
			//	EditForm: <function_name>
			//},
		"INN": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
		},
	};
	
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();