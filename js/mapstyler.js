 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal",
        "modules/Utils"
    ], function(MapController, Palette, Portal, Utils) {
        var mapController = new MapController.MapController("viewDiv");
        var paletteCollection = new Array; //where 0 is the latest and the rest are for the undo stack

        function initialise(){
            createRandomPalette().done(function(){
                console.log(paletteCollection[0]);
                mapController.buildMap().done(function () { 
                    //mapController.applyPalette();
                });
            });
        }

        function createRandomPalette(){
            var paletteWait = $.Deferred();
            paletteCollection[0] = new Palette.Palette();
            var url = "//source.unsplash.com/random";
            $.get(url, function(data, status){
                paletteCollection[0].generateColours(url).done(function(result){
                    paletteCollection[0].setColours(result);
                    paletteWait.resolve();
                });             
            });
            return paletteWait.promise();
        }

        initialise();
        
    });