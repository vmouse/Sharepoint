(function () {
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		"Code": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
			},
		"INN": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
		},
	};
	
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();