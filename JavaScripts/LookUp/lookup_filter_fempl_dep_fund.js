var listFundEmpInnerName = "FundStaff";
var filterFundEmpField = "Fund";
var filterFundEmpOperation = 'eq';

(function() {
    filterFundEmpValue = encodeURI($("#Fund option:selected").text())
    _spBodyOnLoadFunctionNames.push("FundEmpPostRenderHandler");
	_spBodyOnLoadFunctionNames.push("populateSelectOptions");
})();

function FundEmpPostRenderHandler() {
	    $("#Fund").on('change', function() {
		    populateSelectOptions();
		})
}

//var emps = getListItems(_spPageContextInfo.webAbsoluteUrl, listFundEmpInnerName, "", null, null);
function getListItems(listName, query, success, failure) {
    //query example: "field eq 'value'"
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var listId = returnListGuidByInnerName(webUrl, listFundEmpInnerName);
    urlQuery = webUrl + "/_api/web/lists(guid'" + listId + "')/items?$select=ID,Title&$top=5000&$filter=" + query;

    $.ajax({
        url: urlQuery,
        async: false,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose; charset=utf-8"
        },
        success: function(data) {
            success(data.d.results);
          },
        error: function(data) {
            failure(data);
        }
    });
}

function populateSelectOptions() {
	selectCtrl = $("[id^='FundEmp_']");
	listName = "FundStaff";
	query = "Fund eq " + $("#Fund").val();
    getListItems(listName, query,
    		function(data) {
    				selectCtrl.empty();
                    $.each(data, function(i, item) {
                        Title = item.Title;
                        selectCtrl.append("<option value='" + item.ID + "'>" + Title + "</option>");
                    })}, 
            function ajaxError(response) {
                    alert(response.status + ' ' + response.statusText);
                	});
                	
}

