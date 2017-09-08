define([
		"esri/config",
        "esri/portal/Portal",
		"esri/portal/PortalQueryParams",
		"esri/identity/OAuthInfo",
		"esri/identity/IdentityManager",
		"esri/request",
],
    function (esriConfig, Portal, PortalQueryParams, OAuthInfo, esriId, esriRequest) {

        var portal,info;

        function initPortal(){
            portal = new Portal;
            info = new OAuthInfo({
                appId: "OkNkeFOIGhEQYJiD",
                popup: true
            });
            
            esriId.registerOAuthInfos([info]);
        }


        function addItem(json, itemName) {
            var deferred = $.Deferred();
            var urlKey = portal.urlKey;
            var user = portal.user.username;

            var baseUrl = portal.restUrl + '/content/users/' + user;

            var milliseconds = (new Date).getTime();

            esriRequest(baseUrl + '/addItem', {
                method: 'post',
                query: {
                    "f": "json",
                    "type": "Vector Tile Service",
                    "title": 'mapstyler-' + itemName,
                    "url": "https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer",
                    "text": "my JSON text here",
                    "extent": "-140.96, 60, -90.45,40"
                },
                responseType: "json"
            }).then(
				function (response) {
				    esriRequest(baseUrl + '/items/' + response.data.id + '/addResources', {
				        method: 'post',
				        query: {
				            "f": "json",
				            "resourcesPrefix": "styles",
				            "filename": "root.json",
				            "text": JSON.stringify(json)
				        },
				        responseType: "json"
				    }).then(
						function (response) {
                            deferred.resolve();
						}, function (error) {
						    console.log(error);
						}
					);
				}, function (error) {
				    console.log(error);
				}
            );
            return deferred.promise();
        }
        var saveMap = function(style){
            var deferred = $.Deferred();
            portal.authMode = "immediate";
            portal.load().then(function () {
                //$('#signout').show();
                var time = new Date();
                var year = time.getFullYear();
                var month = time.getMonth() + 1;
                var date1 = time.getDate();
                var hour = time.getHours();
                var minutes = time.getMinutes();
                var seconds = time.getSeconds();
                var itemName = date1 + "-" + month + "-" + year + " " + hour + ":" + minutes + ":" + seconds;
                addItem(JSON.parse(style), itemName).done(function(){
                    deferred.resolve();
                },function(error){
                    console.log(error);
                    deferred.resolve("error");
                });
            },function(error){
                console.log(error);
                deferred.resolve("error");
            });
            return deferred.promise();
        }

        //Stuff to make public
        return {
            saveMap: saveMap,
            initPortal: initPortal
        };

        
    });

