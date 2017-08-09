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
            //Unsplash Colours and Patterns collection
            var url = "//source.unsplash.com/collection/175083/800x496";
            $.get(url, function(data, status){
                getLatestPalette().generateColours(url).done(function(){
                    updateSwatches(getLatestPalette());
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
                updateSwatches(getLatestPalette());
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

        function updateSwatches(palette){
            for(colour in palette.colours){
                var c = parseInt(colour)+1;
                $(".swatch:nth-child(" + c + ")").css("background", palette.colours[colour]);
            }
        }
        
     
        var currentColour = $(this).css("background-color");
     
        //Ben edits - color picker
        $("[id^='swatch']").spectrum({
            color: currentColour,
            showInput: true,  
            showInitial: true,
            preferredFormat: "hex",
            chooseText: "Apply",
            change: function(color) {
                $(this).css("background-color",  color.toHexString());
                duplicateLatestPalette();
                //Ben - we need to know the swatch number here
                //Currently set to  0 every time
                getLatestPalette().updateColour(0,color.toHexString());
                mapController.applyPalette(getLatestPalette());
            }
        });
     
        //Events ---------------------------------------------------------------------------------------
        $("#shuffle").click(function(){
            duplicateLatestPalette();
            getLatestPalette().shuffleColours();
            mapController.applyPalette(getLatestPalette());
            updateSwatches(getLatestPalette());
        });

        //Logic ----------------------------------------------------------------------------------------

        initialise();

    });