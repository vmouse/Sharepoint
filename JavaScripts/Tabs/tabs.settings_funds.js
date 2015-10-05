﻿document.write('<link rel="stylesheet" type="text/css" href=\"' + document.location.href.split('/Lists')[0] + '/Style%20Library/Scripts/Tabs/tabs.css\">');
  
var currentFormUniqueId,
	currentFormWebPartId,
    baseViewID = '',
//	listId = 'E45D8F3C-EDB3-46EF-8731-D5A8FFA3A835', //Contacts list guid
    itemId = 0,
    zones = [
    	{tabIndex:'3', zoneId:'MSOZoneCell_WebPartWPQ4'}, // Fund's contacts
    	{tabIndex:'4', zoneId:'MSOZoneCell_WebPartWPQ5'}, // Fund's tasks
    	{tabIndex:'5', zoneId:'MSOZoneCell_WebPartWPQ3'}  // Fund's dosuments
    ];

var tabsObj = [ 
    ["Контактная информация", ["Code", "FundStatus", "ShortName", "WorkAddress", "WorkPhone", "_Comments", "Created", "EMail", "FullName", "ManagersName",  "Title", "WebPage"]], 
    ["Банковские реквизиты", ["Bank", "BIK", "HeadjobTitle", "HeadFL", "INN", "IFNS", "FSS_Code", "bank_corr_account", "KPP", "ORGN", "OKPO", "AuthorityBase", "bank_account", "RNS", "RN_FSS", "RN_FSS_Code", "SNILS", "HeadLN", "RegisterredAddr", "Authror", "Editor"]],
  	["Taxcom", ["HeadjobTitle", "HeadFL", "IFNS", "FSS_Code", "ORGN", "OKPO", "AuthorityBase", "RNS", "RN_FSS", "RN_FSS_Code", "SNILS", "HeadLN", "RegisterredAddr", "Authror", "Editor"]],
    ["Контакты", []],
  	["Задачи", []],
  	["Документы", []]
];

SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {

  function getBaseHtml(ctx) {
    return SPClientTemplates["_defaultTemplates"].Fields.default.all.all[ctx.CurrentFieldSchema.FieldType][ctx.BaseViewID](ctx);
  }

  function init() {
    var overrideCtx = {}; 
    overrideCtx.OnPreRender = TabsOnPreRender;
    overrideCtx.OnPostRender = TabsOnPostRender;
    overrideCtx.Templates = {};
  
    overrideCtx.Templates.Fields = {
    "Title": {
        NewForm: renderRequiredField,
        EditForm: renderRequiredField
      },
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
  }
  
  init();
});