function TabsOnPreRender(ctx) { 
    if (!currentFormUniqueId) { 
 
        currentFormUniqueId = ctx.FormUniqueId; 
        currentFormWebPartId = "WebPart" + ctx.FormUniqueId; 
 
        jQuery(document).ready(function () { 
 
            var tabHTMLTemplate = "<li class='{class}'><a href='#{Index}'>{Title}</a></li>"; 
            var tabClass; 
            var tabsHTML = ""; 
 
            for (var i = 0; i < tabsObj.length; i++) { 
                tabClass = ""; 
                if (i == 0){ tabClass = "active";} 
                tabsHTML += tabHTMLTemplate.replace(/{Index}/g, i).replace(/{Title}/g, tabsObj[i][0]).replace(/{class}/g, tabClass) 
            } 
 
          	jQuery("#" + currentFormWebPartId).prepend("<div class='contacts'><table width='100%' id='Contacts'></table><div id='EpmtyList' style='display: none;'>К сожалению, нет контактов, связанных с данным фондом</div></div>"); 
            jQuery("#" + currentFormWebPartId).prepend("<div class='tasks'><table width='100%' id='Tasks'></table><div id='EpmtyList' style='display: none;'>Пока нет ни каких задач</div></div>"); 
            jQuery("#" + currentFormWebPartId).prepend("<ul class='tabs'>" + tabsHTML + "</ul>");
          	 			
          	baseViewID = ctx.BaseViewID;
          	itemId = ctx.FormContext.itemAttributes.Id;
 
            jQuery('.tabs li a').on('click', function (e) { 
              var currentIndex = jQuery(this).attr('href').replace("#","");
              switch(currentIndex) {
                case '0':
                case '1':
                  jQuery('.contacts').hide();
                  jQuery('.tasks').hide();
                  showTabControls(currentIndex); 
                  break;
                case '2':
                  jQuery('.tasks').hide();
                  jQuery(".ms-formbody").closest('tr').hide();
                  
                  var fond = jQuery('[id^=Title]').val();
                  var contacts = GetContacts(fond);
                  jQuery('.contacts').show();
                  if(contacts.length == 0) {
                  	jQuery('#EpmtyList').show();
                  	jQuery('#Contacts').hide();
                  }
                  else {
                    jQuery('#EpmtyList').hide();
                    jQuery('#Contacts tr').remove();
                    for(var i = 0 ; i < contacts.length; i++) {
                      jQuery('#Contacts').append(
                        '<tr>' +
                        	'<td>&nbsp;' + (i + 1) + '&nbsp;</td>' +
                        	'<td style="width: 350px;"><a class="ms-listlink ms-draggable" href="' + contacts[i].Url + '" target="_blank">' + contacts[i].Title + '</a></td>' +
                        	'<td width="20%">' + (contacts[i].Company == null ? '' : contacts[i].Company) + '</td>' +
                        	'<td width="10%">' + (contacts[i].Phone == null ? '' : contacts[i].Phone) + '</td>' +
                        	'<td width="10%"><a href="mailto:' + contacts[i].Email + '">' + contacts[i].Email + '</a></td>' +
                            '<td>' + contacts[i].Note + '</td>' +
                        '</tr>'
                      );
                    }
                    jQuery('#Contacts').show();
                  }
                  break;
                case '3':
                  jQuery(".ms-formbody").closest('tr').hide();
                  
                  var fond = jQuery('[id^=Title]').val();
                  var tasks = GetTasks(fond);
                  jQuery('.tasks').show();
                  if(tasks.length == 0) {
                    jQuery('#EpmtyList').show();
                    jQuery('#Tasks').hide();
                  }
                  else {
                    jQuery('#EpmtyList').hide();
                    jQuery('#Tasks tr').remove();
                    for(var i = 0 ; i < tasks.length; i++) {
                      jQuery('#Tasks').append(
                        '<tr>' +
                          '<td width="20px">&nbsp;' + (i + 1) + '&nbsp;</td>' +
                          '<td style="width: 350px;"><a class="ms-listlink ms-draggable" href="' + tasks[i].Url + '" target="_blank">' + tasks[i].Title + '</a></td>' +
//                          '<td width="200px">' + (tasks[i].DueDate == null ? '' : tasks[i].DueDate) + '</td>' +
//                          '<td width="10%">' + (tasks[i].Phone == null ? '' : tasks[i].Phone) + '</td>' +
//                          '<td width="10%"><a href="mailto:' + tasks[i].Email + '">' + tasks[i].Email + '</a></td>' +
//                          '<td>' + tasks[i].Note + '</td>' +
                        '</tr>'
                      );
                    }
                    jQuery('#Tasks').show();
                  }
                  break;
              }
              jQuery(this).parent('li').addClass('active').siblings().removeClass('active'); 
              e.preventDefault();   
            }); 
 
            showTabControls(0); 
 
            jQuery("#" + currentFormWebPartId).prepend("<!--mce:0-->"); 
        }); 
 
    } 
} 
 
function TabsOnPostRender(ctx) {
  if(ctx.BaseViewID != 'DisplayForm') {
    var controlId = ctx.ListSchema.Field[0].Name + "_" + ctx.ListSchema.Field[0].Id; 
    jQuery("[id^='" + controlId + "']").closest("tr").attr('id', 'tr_' + ctx.ListSchema.Field[0].Name).hide(); 
  }
} 
 
function showTabControls(index) 
{
  if(baseViewID == 'DisplayForm') {
    jQuery(".ms-formbody").closest('tr').hide();
    
    var allEll = jQuery('td[class="ms-formbody"]');
    for (var i = 0; i < tabsObj[index][1].length; i++) {
      for(var j = 0; j < allEll.length; j++) {
        if(allEll[j].innerHTML.indexOf(tabsObj[index][1][i]) != -1) {
          jQuery(allEll[j]).closest('tr').show();
          break;
        }
      }
    }
  }
  else {
    jQuery("#" + currentFormWebPartId + " [id^='tr_']").hide(); 
 
    for (var i = 0; i < tabsObj[index][1].length; i++) { 
        jQuery("[id^='tr_" + tabsObj[index][1][i] + "']").show(); 
    }
  }
}

function GetContacts(fond) {
  var host = _spPageContextInfo.webAbsoluteUrl;
  var contacts = [];
  jQuery.ajax({
        url: host + "/_api/web/lists(guid'" + listId + "')/items?$expand=ParentList/Forms&$filter=FundId%20eq%20" + itemId,
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (response) {
          for(var i = 0 ; i < response.d.results.length; i++) {
            contacts.push({
              Url: response.d.results[i].ParentList.Forms.results[0].ServerRelativeUrl + '?ID=' + response.d.results[i].Id,
              Title: response.d.results[i].Title + ' ' + response.d.results[i].FirstName,
              Company: response.d.results[i].Company,
              Phone: response.d.results[i].WorkPhone,
              Email: response.d.results[i].Email,
              Note: response.d.results[i].Comments
            });
          }
        },
        error: function (responseErr) {
            alert(responseErr.responseText);
        }
    });
  return contacts;
}

function GetTasks(fond) {
  var host = _spPageContextInfo.webAbsoluteUrl;
  var tasks = [];
  jQuery.ajax({
        url: host + "/_api/web/lists(guid'" + tasksId + "')/items?$expand=ParentList/Forms&$filter=FundId%20eq%20" + itemId,
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (response) {
          for(var i = 0 ; i < response.d.results.length; i++) {
            tasks.push({
              Url: response.d.results[i].ParentList.Forms.results[0].ServerRelativeUrl + '?ID=' + response.d.results[i].Id,
              Title: response.d.results[i].Title,
              DueDate: response.d.results[i].DueDate,
//              Phone: response.d.results[i].WorkPhone,
//              Email: response.d.results[i].Email,
//              Note: response.d.results[i].Comments
            });
          }
        },
        error: function (responseErr) {
            alert(responseErr.responseText);
        }
    });
  return tasks;
}