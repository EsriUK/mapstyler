 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal",
        "modules/Utils"
    ], function(MapController, Palette, Portal, Utils) {
        var mapController = new MapController.MapController("viewDiv");
        var paletteCollection = new Array; //where 0 is the latest and the rest are for the undo stack

        //Initialises the application on first load
        //Builds a map and creates a palette from a random Unsplash image
        function initialise(){
            createRandomPalette().done(function(){
                mapController.buildMap().done(function () { 
                    mapController.applyPalette(getLatestPalette());
                });
            });
        } 

        function createRandomPalette(){
            var paletteWait = $.Deferred();
            var myPalette = new Palette.Palette();
            paletteCollection.push(myPalette);
            var url = "//source.unsplash.com/random";
            $.get(url, function(data, status){
                paletteCollection[0].generateColours(url).done(function(){
                    //paletteCollection[0].setColours(result);
                    paletteWait.resolve();
                });             
            });
            return paletteWait.promise();
        }

        function getLatestPalette(){
            return paletteCollection[0];
        }

        initialise();
        
    });