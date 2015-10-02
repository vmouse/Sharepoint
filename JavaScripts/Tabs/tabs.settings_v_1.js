document.write('<link rel="stylesheet" type="text/css" href=\"' + document.location.href.split('/Lists')[0] + '/Style%20Library/Scripts/Tabs/tabs.css\">');
  
var currentFormUniqueId,
	currentFormWebPartId,
    baseViewID = '',
	  listId = '4a3c72d0-2bd9-41c6-8744-195b9dbdaec7', //Contacts list guid
    tasksId = '58610787-7e28-4266-be9e-18a4f1a25977', //Contacts list guid
    itemId = 0;

var tabsObj = [ 
    ["Контактная информация", ["Code", "FundStatus", "ShortName", "WorkAddress", "WorkPhone", "_Comments", "Created", "EMail", "FullName", "ManagersName",  "Title", "WebPage"]], 
    ["Банковские реквизиты", ["Bank", "BIK", "HeadjobTitle", "HeadFL", "INN", "IFNS", "FSS_Code", "bank_corr_account", "KPP", "ORGN", "OKPO", "AuthorityBase", "bank_account", "RNS", "RN_FSS", "RN_FSS_Code", "SNILS", "HeadLN", "RegisterredAddr", "Authror", "Editor"]],
    ["Контакты", []],
    ["Задачи", []]
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
      //"FieldName": {
        //  NewForm: <function_name>
        //  EditForm: <function_name>
        //},
      "Code": {
        NewForm: renderRequiredField,
        EditForm: renderRequiredField
      },
    };
    
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx); 
  }
  
  init();
});