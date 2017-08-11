define([
		"esri/config",
        "esri/portal/Portal",
		"esri/portal/PortalQueryParams",
		"esri/identity/OAuthInfo",
		"esri/identity/IdentityManager",
		"esri/request",
],
    function (esriConfig, Portal, PortalQueryParams, OAuthInfo, esriId, esriRequest) {

        var portal = new Portal;
        var info = new OAuthInfo({
            appId: "OkNkeFOIGhEQYJiD",
            popup: true
        });
        
        esriId.registerOAuthInfos([info]);

        function addItem(json, itemName) {
            console.log(json.version);
            console.log(portal);

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
						    $('#save > img').attr("src", "img/heart-shape-filled.svg");
						    $('.sk-circle').hide();
						    $('#save > img').show();
						    
						}, function (error) {
						    console.log(error);
						}
					);
				}, function (error) {
				    console.log(error);
				}
			);
        }

        $('#signout').on("click", function () {
            esriId.destroyCredentials();
            window.location.reload();
        });

        $('#save').click(function () {
            //$('#save > img').hide();
            //$('.sk-circle').show();
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
                addItem(newStyle, itemName);
            });
        });
    });

