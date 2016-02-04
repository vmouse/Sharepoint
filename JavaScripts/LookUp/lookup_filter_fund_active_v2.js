var ListName = 'Фонды';
var ListView = 'Основные фонды';
var UseRootWeb = true;

(function () {
	var renderCtx = {};
    renderCtx.Templates = {};
    renderCtx.Templates.Fields = {
        "Fund": { "NewForm": renderItem, "EditForm": renderItem},
    };

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(renderCtx);
})();


function getCurrentWebUrl() {
    if (UseRootWeb) {
        return _spPageContextInfo.siteAbsoluteUrl;
    }  else {
        return _spPageContextInfo.webAbsoluteUrl;
    }
}

function getListItems(listTitle, queryText, webUrl)
{
    webUrl = webUrl || getCurrentWebUrl();

    var viewXml = '<View><Query>' + queryText + '</Query></View>';
    var url = webUrl + "/_api/web/lists/getbytitle('" + listTitle + "')/getitems";
    var queryPayload = {
        'query' : {
            '__metadata': { 'type': 'SP.CamlQuery' },
            'ViewXml' : viewXml
        }
    };
    return executeJson(url,"POST",null,queryPayload);
}


function getListViewItems(listTitle, viewTitle, webUrl)
{
    webUrl = webUrl || getCurrentWebUrl();

    var url = webUrl + "/_api/web/lists/getByTitle('" + listTitle + "')/Views/getbytitle('" + viewTitle + "')/ViewQuery";
    return executeJson(url).then(
        function(data){
            var viewQuery = data.d.ViewQuery;
            return getListItems(listTitle, viewQuery, webUrl);
        });
}


function executeJson(url, method, headers, payload, asyncCall)
{
    method = method || 'GET';
    headers = headers || {};
    asyncCall = asyncCall || false;
    headers["Accept"] = "application/json;odata=verbose";
    if(method == "POST") {
        headers["X-RequestDigest"] = $("#__REQUESTDIGEST").val();
    }
    var ajaxOptions =
    {
        url: url,
        type: method,
        contentType: "application/json;odata=verbose",
        async: asyncCall,
        headers: headers
    };
    if (typeof payload != 'undefined') {
        ajaxOptions.data = JSON.stringify(payload);
    }
    return $.ajax(ajaxOptions);
}


function renderItem(ctx){

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

    getListViewItems(ListName, ListView)
        .done(function(data)
        {
            var items = data.d.results;
            for(var i = 0; i < items.length;i++) {
                console.log(items[i].Title);
                if(selectedValue==items[i].ID+";#"+items[i].Title)
                    fieldHtml += "<option selected value='" + items[i].ID + "'>" + items[i].Title + "</option>";
                else
                    fieldHtml += "<option value='" + items[i].ID + "'>" + items[i].Title + "</option>";
            }
        })
        .fail(
        function(error){
            console.log(JSON.stringify(error));
        })

    fieldHtml += '</select>';
    return fieldHtml;
}
