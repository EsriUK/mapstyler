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
                createPaletteFromImage(url)            
            });
            return paletteWait.promise();
        }

        function createPaletteFromImage(image){
            var paletteWait = $.Deferred();
            var myPalette = new Palette.Palette();
            paletteCollection.push(myPalette);
            
            getLatestPalette().generateColours(image).done(function(){
                updateSwatches(getLatestPalette());
                mapController.applyPalette(getLatestPalette());
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
                var id = this.id.substring(7, 8);
                getLatestPalette().updateColour(id-1,color.toHexString());
                mapController.applyPalette(getLatestPalette());
                $("[id^='swatch']").css("pointer-events", "auto");
            }
        });  
       
        $("[id^='swatch']").click(function() {
            $("[id^='swatch']").spectrum("set", $(this).css("background"));
            $("[id^='swatch']").css("pointer-events", "none");
        });
     
        //Fires when an image is dropped onto the map or the info panel
        function imageReceived(e) {
            e.preventDefault();            
            var dataTransfer	= e.originalEvent.dataTransfer;
            var reader			= new FileReader();
            if (dataTransfer && dataTransfer.files.length) {      
				e.stopPropagation();
                //Using a for loop, but we will only ever have a single file
				$.each(dataTransfer.files, function (i, file) {
                    var reader = new FileReader();
                    reader.onload = $.proxy(function (file, $fileList, event) {
                        createPaletteFromImage(event.target.result)
                    }, this, file, $("#fileList"));
                    reader.readAsDataURL(file);
                });
            } else {
                var imagepath	= dataTransfer.getData('text/html');
                var imagesrc	= imagepath.match(new RegExp('src="' + '(.*)' + '"'))[1].split('"')[0];
				createPaletteFromImage(imagesrc)
            }
        }

        //Get image from manual upload or mobile input stuff
        function getImageUpload(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    createPaletteFromImage(e.currentTarget.result)
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

     
        //Events ---------------------------------------------------------------------------------------
        $("#shuffle").click(function(){
            duplicateLatestPalette();
            getLatestPalette().shuffleColours();
            mapController.applyPalette(getLatestPalette());
            updateSwatches(getLatestPalette());

            
        });

        //When the upload button is engaged with, run the function to get the data
        $("#upload").change(function(){
            getImageUpload(this);
        });

         //Wait for an image to be dropped on the lower right UI panel...
        $('.card').on({
            'dragover dragenter': function (e) {
                e.preventDefault();
                e.stopPropagation();
            },
            'drop': function (e) {
                imageReceived(e);
            }
        });
        //...or the map itself
        $('#viewDiv').on({
            'dragover dragenter': function (e) {
                e.preventDefault();
                e.stopPropagation();
            },
            'drop': function (e) {
                imageReceived(e);
            }
        });

        

        //Logic ----------------------------------------------------------------------------------------

        initialise();

    });