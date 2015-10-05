function TabsOnPreRender(ctx) { 
    if (!currentFormUniqueId) { 
 
        currentFormUniqueId = ctx.FormUniqueId; 
        currentFormWebPartId = "WebPart" + ctx.FormUniqueId;
        if(ctx.BaseViewID === 'NewForm') {
        	var tabs = jQuery('.tabs a');
        	for(var i in zones) {
        		;//if()
        	}
        }
 
        jQuery(document).ready(function () {
        
        	hideAllZones();
 
            var tabHTMLTemplate = "<li class='{class}'><a href='#{Index}'>{Title}</a></li>"; 
            var tabClass; 
            var tabsHTML = ""; 
 
            for (var i = 0; i < tabsObj.length; i++) { 
                tabClass = ""; 
                if (i == 0){ tabClass = "active";} 
                
                if(ctx.BaseViewID === 'NewForm') {
                	var zone = checkZone(i);
                	if(zone.tabIndex === undefined)
                		tabsHTML += tabHTMLTemplate.replace(/{Index}/g, i).replace(/{Title}/g, tabsObj[i][0]).replace(/{class}/g, tabClass);
                }
                else
	                tabsHTML += tabHTMLTemplate.replace(/{Index}/g, i).replace(/{Title}/g, tabsObj[i][0]).replace(/{class}/g, tabClass);
            } 
 
          	jQuery("#" + currentFormWebPartId).prepend("<div class='contacts'><table width='100%' id='Contacts'></table><div id='EpmtyList' style='display: none;'>К сожалению, нет контактов, связанных с данным фондом</div></div>"); 
            jQuery("#" + currentFormWebPartId).prepend("<ul class='tabs'>" + tabsHTML + "</ul>");
          	 			
          	baseViewID = ctx.BaseViewID;
          	if(ctx.FormContext)
	          	itemId = ctx.FormContext.itemAttributes.Id;
 
            jQuery('.tabs li a').on('click', function (e) { 
              var currentIndex = jQuery(this).attr('href').replace("#","");
              switch(currentIndex) {
                case '0':
                case '1':
                case '2':
                  hideAllZones();
                  jQuery("input[id$='GoBack']").closest('table').closest('tr').closest('table').closest('tr').closest('table').show();
                  jQuery("input[id$='GoBack']").closest('table').closest('tr').closest('table').closest('tr').closest('table').prev().show();
                  
                  showTabControls(currentIndex); 
                  break;
                default:
                	hideAllZones();
                	jQuery("input[id$='GoBack']").closest('table').closest('tr').closest('table').closest('tr').closest('table').hide();
                	jQuery("input[id$='GoBack']").closest('table').closest('tr').closest('table').closest('tr').closest('table').prev().hide();
                	jQuery(".ms-formbody").closest('tr').hide();
                	
                	var zone = checkZone(currentIndex);
                	if(zone) {
                		jQuery('#' + zone.zoneId).show();
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
  jQuery('#DeltaPlaceHolderMain').show();
  
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

function hideAllZones() {
	for(var i in zones)
		jQuery('#' + zones[i].zoneId).hide();
}
function checkZone(index) {
	for(var i in zones) {
		if(zones[i].tabIndex == index)
			return zones[i];
	}
	return {};
}