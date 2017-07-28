 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal",
        "modules/Utils"
    ], function(MapController, Palette, Portal, Utils) {
        var mapController = new MapController.MapController("viewDiv");
        var paletteCollection = new Array; //where 0 is the latest and the rest are for the undo stack

        function initialise(){
            paletteCollection[0] = new Palette();
            mapController.buildMap().done(function () { 
                //mapController.applyPalette();
            });

        }
        
    });