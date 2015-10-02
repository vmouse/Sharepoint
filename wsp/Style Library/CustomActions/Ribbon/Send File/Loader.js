var currentSelectedMenuItemId = 0;

Type.registerNamespace('CustomDynamic.SharePoint.Ribbon.PageComponent');

CustomDynamic.SharePoint.Ribbon.PageComponent = function () {

    CustomDynamic.SharePoint.Ribbon.PageComponent.initializeBase(this);
}

CustomDynamic.SharePoint.Ribbon.PageComponent.initialize = function () {

    ExecuteOrDelayUntilScriptLoaded(Function.createDelegate(null, CustomDynamic.SharePoint.Ribbon.PageComponent.initializePageComponent), 'SP.Ribbon.js');
}
CustomDynamic.SharePoint.Ribbon.PageComponent.initializePageComponent = function () {

    var ribbonPageManager = SP.Ribbon.PageManager.get_instance();
    if (null !== ribbonPageManager) {
        ribbonPageManager.addPageComponent(CustomDynamic.SharePoint.Ribbon.PageComponent.instance);
    }
}
CustomDynamic.SharePoint.Ribbon.PageComponent.prototype = {
    init: function () {
    },

    getFocusedCommands: function () {
        return ['Ribbon.CustomActions.LoadItems', 'Ribbon.CustomActions.SendFile'];
    },

    getGlobalCommands: function () {
        return ['Ribbon.CustomActions.LoadItems', 'Ribbon.CustomActions.SendFile'];
    },

    canHandleCommand: function (commandId) {
        if ((commandId === 'Ribbon.CustomActions.LoadItems', 'Ribbon.CustomActions.SendFile')) {
            return true;
        } else {
            return false;
        }
    },
    handleCommand: function (commandId, properties, sequence) {

        if (commandId === 'Ribbon.CustomActions.LoadItems') {

            ExecuteOrDelayUntilScriptLoaded(Function.createDelegate(null, getItems), 'SP.js');

            properties.PopulationXML = getItems();
        }
        if (commandId === 'Ribbon.CustomActions.SendFile') {
            currentSelectedMenuItemId = properties.SourceControlId.toString().substr(properties.SourceControlId.toString().lastIndexOf('.') + 1, properties.SourceControlId.toString().length);
        }
    },
    isFocusable: function () {
        return true;
    },

    receiveFocus: function () {
        return true;
    },

    yieldFocus: function () {
        return true;
    }
}

function getItems() { return QueryLocations(); }

CustomDynamic.SharePoint.Ribbon.PageComponent.registerClass('CustomDynamic.SharePoint.Ribbon.PageComponent', CUI.Page.PageComponent);
CustomDynamic.SharePoint.Ribbon.PageComponent.instance = new CustomDynamic.SharePoint.Ribbon.PageComponent();

NotifyScriptLoadedAndExecuteWaitingJobs("Loader.js");