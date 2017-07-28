 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal",
        "modules/Utils"
    ], function(MapController, Palette, Portal, Utils) {
        var mapController = new MapController.MapController("viewDiv");
        var paletteCollection = new Array; //where 0 is the latest and the rest are for the undo stack

        function initialise(){
            createRandomPalette();
            mapController.buildMap().done(function () { 
                //mapController.applyPalette();
            });
        }

        function createRandomPalette(){
            var url = "//source.unsplash.com/random";
            $.get(url, function(data, status){
                paletteCollection.push(new Palette.Palette(url));
            });
        }

        initialise();
        
    });