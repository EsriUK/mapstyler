 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal",
        "modules/Utils"
    ], function(MapController, Palette, Portal, Utils) {
        //Session Variables-----------------------------------------------------------------------------
        var mapController = new MapController.MapController("viewDiv");
        var paletteCollection = new Array; //where 0 is the latest and the rest are for the undo stack

        //Functions  -----------------------------------------------------------------------------------

        function initialise(){
            mapController.buildMap().done(function () {
                createRandomPalette().done(function(){
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
                getLatestPalette().generateColours(url).done(function(){
                    paletteWait.resolve();
                });             
            });
            return paletteWait.promise();
        }

        function createPaletteFromImage(){
            var paletteWait = $.Deferred();
            var myPalette = new Palette.Palette();
            paletteCollection.push(myPalette);
            
            getLatestPalette().generateColours(url).done(function(){
                paletteWait.resolve();
            });       
                  
            return paletteWait.promise();
        }

        function getLatestPalette(){
            return paletteCollection[0];
        }

        function createNewPalette(){
            var myPalette = new Palette.Palette();
            paletteCollection.push(myPalette);
            //tbc
        }

        function duplicateLatestPalette(){
            paletteCollection.push(paletteCollection[0]);
        }

        //Events ---------------------------------------------------------------------------------------
        $("#shuffle").click(function(){
            console.log("click");
            duplicateLatestPalette();
            getLatestPalette().shuffleColours();
            mapController.applyPalette(getLatestPalette());
        });

        //Logic ----------------------------------------------------------------------------------------

        initialise();

    });