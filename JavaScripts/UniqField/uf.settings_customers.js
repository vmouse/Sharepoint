(function () {
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		"Code0": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
			},
		"INN0": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
		},
	};
	
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();