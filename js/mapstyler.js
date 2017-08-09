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
            //var url = "//source.unsplash.com/collection/175083/800x496";
            var url = "//lh3.googleusercontent.com/SO4jvgiZlVezRvc9yIoVy-kYL6xmMzPdsKycymYzGr5nZBheBwJKUY24pgfI_lCG28a_-ec934E=w640-h400-e365";
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
        
       $("[id^='swatch']").spectrum({
            showInput: true,  
            showInitial: true,
            preferredFormat: "hex",
            chooseText: "Apply",
            change: function(color) {
                $(this).css("background",  color.toHexString());
                duplicateLatestPalette();
                getLatestPalette().updateColour(0,color.toHexString());
                mapController.applyPalette(getLatestPalette());
                $("#picker").spectrum("destroy");
            }
        });
     
        $("[id^='swatch']").click(function() {
            console.log(this);
            $("[id^='swatch']").spectrum("set", $(this).css("background"));
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