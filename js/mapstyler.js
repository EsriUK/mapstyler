 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal"
    ], function(MapController, Palette, Portal) {
        var mapController = new MapController.MapController("viewDiv");
        mapController.buildMap();
    });