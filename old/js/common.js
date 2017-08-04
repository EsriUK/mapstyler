//Fix IE11 issue with .startswith
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

//Globals
var newStyle;
var originalStyle;

require([
		"esri/config",
        "esri/portal/Portal",
		"esri/portal/PortalQueryParams",
		"esri/identity/OAuthInfo",
		"esri/identity/IdentityManager",
		"esri/request",
        "dojo/domReady!"
],
    function (esriConfig, Portal, PortalQueryParams, OAuthInfo, esriId, esriRequest) {

        var portal = new Portal;
        var info = new OAuthInfo({
            appId: "GBmcBQTOrMqfyzZd",
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
            $('#save > img').hide();
            $('.sk-circle').show();
            portal.authMode = "immediate";
            portal.load().then(function () {
                $('#signout').show();
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

//Array containing all colours from the dark gray canvas vector tie layer
var array = ["#222326", "#222426", "#2d2c2e", "#323133", "#373638", "#3b3a3c", "#3f3e40",
           "#414042", "#424143", "#464748", "#474648", "#4a494b", "#494b4a", "#49484a", "#4e4d4f",
           "#59585a", "#5a595b", "#5b5a5c", "#5d5c5e", "#5f5e60", "#666666", "#6e6d6f", "#787779",
           "#828282", "#808781", "#868587", "#939294", "#969696", "#99989a", "#9c9c9c", "#a2a2a6",
           "#abaaac", "#aeadaf", "#cfcfd4", "#dddcde", "#f5f2dc", "#fdfdfd", "#ffffff"
];

//Generate a colour ramp between two colours using RainbowVIS-JS - https://github.com/anomal/RainbowVis-JS
function getColourRamp(first, last) {
    //Use the number of colours in the dark gray canvas vector tile colour array to define how many colours in the generated colour ramp
    var numberOfItems = array.length;
    var rainbow = new Rainbow();
    rainbow.setNumberRange(1, numberOfItems);
    rainbow.setSpectrum(first, last);
    var dict = [];
    for (var i = 1; i <= numberOfItems; i++) {
        dict[array[i - 1]] = "#" + rainbow.colourAt(i).toUpperCase();
    }
    return dict;
}

//Function to do a find and replace in the style JSON to replace original colour values with new ones
function stringReplace(str, replaceWhat, replaceTo) {
    replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var re = new RegExp(replaceWhat, 'gi');
    return str.replace(re, replaceTo);
}

//Function for updating the map's style
function styleSwitch(colours) {

    var style = originalStyle;
    var dict = getColourRamp(colours[0], colours[1]);

    for (var i = 0; i <= array.length; i++) {
        style = stringReplace(style, '"background-color":"' + array[i] + '"', '"background-color":"' + dict[array[i]] + '"')
        style = stringReplace(style, '"fill-color":"' + array[i] + '"', '"fill-color":"' + dict[array[i]] + '"');
        style = stringReplace(style, '"fill-outline-color":"' + array[i] + '"', '"fill-outline-color":"' + dict[array[i]] + '"');
        style = stringReplace(style, '"text-color":"' + array[i] + '"', '"text-color":"' + colours[3] + '"');
        style = stringReplace(style, '"text-halo-color":"' + array[i] + '"', '"text-halo-color":"' + colours[4] + '"');
        style = stringReplace(style, '"line-color":"' + array[i] + '"', '"line-color":"' + colours[2] + '"');
    }
    var newStyle = JSON.parse(style);
    return newStyle;
}