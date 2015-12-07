(function () {
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		"SerialNo": {
			NewForm: renderRequiredField,
			EditForm: renderRequiredField
			},
	};
	
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();