define([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/VectorTileLayer",
    "dojo/domReady!"
], function(Map, MapView, VectorTileLayer) {

    //Constructor for a new MapController
    var MapController = function (viewDiv){
        this.viewDiv = viewDiv;
    }
    
    //Builds the default map
    MapController.prototype.buildMap = function(){
        var mapWait = $.Deferred();
        var item = "https://arcgis.com/sharing/rest/content/items/5ad3948260a147a993ef4865e3fad476";
        var map = new Map();

        var view = new MapView({
            container: viewDiv,
            map: map,
            zoom: 13,
            center: [-0.010557, 51.495997]
        });

        var tileLyr = new VectorTileLayer({
            url: item + "/resources/styles/root.json"
        });
        
		map.add(tileLyr).then(function(){
            mapWait.resolve();
        });

        return mapWait.promise();
    }

    //Takes a palette object and applies it to the map
    MapController.prototype.applyPalette = function(palette){
    }

    //Stuff to make public
    return {
        MapController: MapController
        
    };
});