CustomDynamic.SharePoint.Ribbon.PageComponent.initialize();

function EnableButton() {
    var context = SP.ClientContext.get_current();
    var list;
    var selectedItems = SP.ListOperation.Selection.getSelectedItems(context);
    if (selectedItems.length == 0)
        return false;
    else
        return true;
}
function SendFile(_list, _selectedItemsId) {

    if (_selectedItemsId == "null") {
        SP.UI.Notify.addNotification('Не выбран ни один файл. Пожалуйста, повторите ввод.');
        return;
    }

    var list = new String(_list).replace('{', '').replace('}', ''),
    	serverUrl = document.location.protocol + '//' + document.location.host,
    	filesId = _selectedItemsId.split(',');

    var config = GetCurrentConfig(currentSelectedMenuItemId);
    if (config.id == 0) {
        alert('Не удалось получить настройки. Пожалуйста, обратитесь к Администратору');
        return;
    }
    var digest = GetDigest(config.targetSiteUrl);

    for (var i = 0 ; i < filesId.length; i++) {
        var file = GetFile(list, filesId[i]);
        GetFileBody(file, config, digest).done(function (result) {
            CopyFile(result).done(function (parms) {

                SP.UI.Notify.addNotification('Копирование завершено: ' + parms.file.Name);
                console.log('Копирование завершено: ' + parms.file.Name);

                if (parms.config.includeMetadata) {
                    console.log('   Попытка обновить метаданные...');

                    var fileInfo = GetResultFileMetadata(parms);
                    if (!fileInfo.isCTExist) {
                        alert('В конечной библиотеке отсутствует необходимый Тип контента. Метаданные не перенесены.');
                        parms.dialog.close();
                        return;
                    }
                    console.log('      Тип контента найден, обновляем...');

                    UpdateItemMetadata(parms, fileInfo);
                }
                parms.dialog.close();
            });
        });
    }
}

function QueryLocations() {
    var options = GetSettings();

    var sb = new Sys.StringBuilder('<Menu Id="Ribbon.CustomActions.Tab.GroupOne.SendFile.Menu">');
    sb.append('<MenuSection Id="Ribbon.CustomActions.Tab.GroupOne.SendFile.Menu.MenuSectionOne">');
    sb.append('<Controls Id="Ribbon.CustomActions.Tab.GroupOne.SendFile.Menu.Controls">');
    for (var i = 0 ; i < options.length; i++) {
        sb.append('<Button ');
        sb.append('Id="Ribbon.CustomActions.Tab.GroupOne.SendFile.Menu.CC.' + options[i].id + '" ');
        sb.append('Command="Ribbon.CustomActions.SendFile" CommandType="General" ');
        sb.append('LabelText="' + options[i].title + '" />');
    }
    sb.append('</Controls>');
    sb.append('</MenuSection>');
    sb.append('</Menu>');

    return sb.toString();
}
function GetSettings() {
    var host = _spPageContextInfo.webAbsoluteUrl;
    var listId = '';
    //get settings list Id
    jQuery.ajax({
        url: host + "/_api/web/lists?$expand=RootFolder&$select=ID&$filter=RootFolder/Name%20eq%20%27CustomCopySettings%27",
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (response) {
            if (response.d.results.length == 0)
                return;
            listId = response.d.results[0].Id
        },
        error: function (responseErr) {
            alert(responseErr.responseText);
        }
    });


    var settings = [];
    if (listId === '')
        return settings;

    //get settings items from list
    jQuery.ajax({
        url: host + "/_api/web/lists(guid'" + listId + "')/items?$select=ID,Title,AbsoluteSiteUrl,FolderRelativeUrl,IncludeMetadata",
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (items) {
            for (var i = 0 ; i < items.d.results.length; i++) {
                settings.push({
                    id: items.d.results[i].ID,
                    title: items.d.results[i].Title,
                    absoluteSiteUrl: items.d.results[i].AbsoluteSiteUrl,
                    relativeFolderUrl: items.d.results[i].FolderRelativeUrl,
                    includeMetadata: items.d.results[i].IncludeMetadata
                });
            }
        },
        error: function (responseErr) {
            alert(responseErr.responseText);
        }
    });
    return settings;
}
function GetCurrentConfig(id) {
    var settings = GetSettings();
    var config = { id: 0 };
    for (var i = 0 ; i < settings.length; i++) {
        if (settings[i].id == id) {
            config = settings[i];
        }
    }
    return config;
}


function GetFile(list, id) {
    var host = _spPageContextInfo.webAbsoluteUrl;
    var file = {};
    jQuery.ajax({
        url: host + "/_api/web/lists(guid'" + list + "')/items(" + id + ")/?$expand=File,ContentType,ContentType/Fields",
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (response) {

            file['ServerRelativeUrl'] = response.d.File.ServerRelativeUrl;
            file['ListId'] = list;
            file['ItemId'] = id;
            file['data'] = {};
            file['uri'] = response.d.File.__metadata.uri;
            file['Name'] = response.d.File.Name;

            for (var i = 0 ; i < response.d.ContentType.Fields.results.length; i++) {
                if (['ContentType', 'Created', 'Created_x0020_By', 'Modified', 'Modified_x0020_By', 'SelectFilename', 'FileLeafRef', 'SharedWithDetails', 'SharedWithUsers'].indexOf(response.d.ContentType.Fields.results[i].InternalName) != -1)
                    continue;
                if (response.d.ContentType.Fields.results[i].InternalName[0] === '_')
                    continue;
                if (!response.d.ContentType.Fields.results[i].Hidden) {
                    switch (response.d.ContentType.Fields.results[i].TypeAsString) {
                        case 'Lookup':
                            file.data[response.d.ContentType.Fields.results[i].InternalName + 'Id'] =
                                response.d[response.d.ContentType.Fields.results[i].InternalName + 'Id'];
                            break;
                        case 'LookupMulti':
                            file.data[response.d.ContentType.Fields.results[i].InternalName + 'Id'] =
                                response.d[response.d.ContentType.Fields.results[i].InternalName + 'Id'].results.join(';');
                            break;
                        case 'Text':
                        case 'Note':
                        case 'Number':
                        case 'URL':
                        case 'Choice':
                        case 'DateTime':
                        default:
                            file.data[response.d.ContentType.Fields.results[i].InternalName] =
                                    response.d[response.d.ContentType.Fields.results[i].InternalName];
                            break
                    }
                }
            }
            file.ContentType = response.d.ContentType.Name;
            file.data['ContentTypeId'] = response.d.ContentTypeId;
            file.data['__metadata'] = response.d.__metadata;
            delete file.data['__metadata'].etag;
            delete file.data['__metadata'].id;
            delete file.data['__metadata'].uri;
        },
        error: function (responseErr) {
            alert(responseErr.responseText);
        }
    });
    return file;
}
function GetDigest(targetUrl) {
    var digest = '';
    jQuery.ajax({
        url: targetUrl + "/_api/contextinfo",
        async: false,
        type: "POST",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (response) {
            digest = response.d.GetContextWebInformation.FormDigestValue;
        },
        error: function (response) {
            alert(response.responseText);
        }
    });
    return digest;
}

//async - > sync
function GetFileBody(file, config, digest) {

    var dfd = jQuery.Deferred(function () {
        var dialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Копирую', 'Пожалуйста, подождите...', 100, 300),
            sourceExecutor = new SP.RequestExecutor(file.ServerRelativeUrl),
            getFileAction = {
                url: file.uri + "/$value",
                method: "GET",
                binaryStringResponseBody: true,
                success: function (fileData) {
                    var result = {
                        file: file,
                        body: fileData.body,
                        dialog: dialog,
                        config: config,
                        digest: digest
                    };
                    dfd.resolve(result);
                },
                error: function (response) {
                    alert(response.responseText);
                    dialog.close();
                }
            };
        sourceExecutor.executeAsync(getFileAction);
    });
    return dfd.promise();
}
function CopyFile(parms) {

    var dfd = jQuery.Deferred(function () {
        var targetExecutor = new SP.RequestExecutor(parms.config.absoluteSiteUrl),
                copyFileAction = {
                    url: parms.config.absoluteSiteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + parms.config.relativeFolderUrl + "')/Files/Add(url='" + parms.file.Name + "', overwrite=true)",
                    method: "POST",
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "X-RequestDigest": parms.digest
                    },
                    contentType: "application/json;odata=verbose",
                    binaryStringRequestBody: true,
                    body: parms.body,
                    success: function (copyFileData) {
                        dfd.resolve(parms);
                    },
                    error: function (ex) {
                        alert(ex.responseText);
                        parms.dialog.close();
                    }
                };
        targetExecutor.executeAsync(copyFileAction);
    });
    return dfd.promise();
}

//--------------

function GetResultFileMetadata(parms) {
    var fileInfo = {};
    fileInfo['isCTExist'] = false;
    jQuery.ajax({
        url: parms.config.absoluteSiteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + parms.config.relativeFolderUrl + "')/Files('" + parms.file.Name + "')?$expand=ListItemAllFields,ListItemAllFields/ParentList,ListItemAllFields/ParentList/ContentTypes,ListItemAllFields/ParentList/Fields",
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (response) {
            fileInfo['Id'] = response.d.ListItemAllFields.ID;
            fileInfo['ListId'] = response.d.ListItemAllFields.ParentList.Id;
            for (var i = 0 ; i < response.d.ListItemAllFields.ParentList.ContentTypes.results.length; i++) {
                if (response.d.ListItemAllFields.ParentList.ContentTypes.results[i].Name === parms.file.ContentType)
                    fileInfo.isCTExist = true;
            }
            if (fileInfo.isCTExist) {
                fileInfo['fields'] = [];
                for (var i = 0; i < response.d.ListItemAllFields.ParentList.Fields.results.length ; i++) {
                    if (!response.d.ListItemAllFields.ParentList.Fields.results.Hidden)
                        fileInfo.fields.push(response.d.ListItemAllFields.ParentList.Fields.results[i].InternalName.replace(/_x0020_/, ' '));
                }
            }
            fileInfo['type'] = response.d.ListItemAllFields.__metadata.type;
        },
        error: function (error) {
            alert(error);
            parms.dialog.close();
        }
    });
    return fileInfo;
}
function UpdateItemMetadata(parms, fileInfo) {

    //prepare data
    parms.file.data.__metadata.type = fileInfo.type;
    for (var property in parms.file.data) {
        if (parms.file.data.hasOwnProperty(property)) {

            if (property === '__metadata')
                continue;

            if (fileInfo.fields.indexOf(property) == -1)
                delete parms.file.data[property];
        }
    }
    //------------------------------------


    jQuery.ajax({
        async: false,
        url: parms.config.absoluteSiteUrl + "/_api/web/lists(guid'" + fileInfo.ListId + "')/items(" + fileInfo.Id + ")",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(parms.file.data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": parms.digest,
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function (response) {
            console.log('      Метаданные успешно обновлены!');
        },
        error: function (error) {
            alert(JSON.stringify(error));
        }
    });
}


//-----------------------------Helpers------------------------------

function URLDecode(psEncodeString) {
    var lsRegExp = /\+/g;
    return unescape(String(psEncodeString).replace(lsRegExp, " "));
}