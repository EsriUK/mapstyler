 require([
        "modules/MapController",
        "modules/Palette",
        "modules/Portal",
        "modules/Utils"
    ], function(MapController, Palette, Portal, Utils) {
        //Session Variables-----------------------------------------------------------------------------
        var mapController = new MapController.MapController("viewDiv");
        var paletteCollection = new Object; 
        paletteCollection.palettes = new Array; //where 0 is the latest and the rest are for the undo stack
        paletteCollection.firstLoad = true;
        paletteCollection.history = 5; //number of palletes to store for the undo stack
        paletteCollection.undoPosition = 1;

        //Functions  -----------------------------------------------------------------------------------

        //Build the map and generate a palette from a random image
        function initialise(){
            mapController.buildMap().done(function () {
                createRandomPalette().done(function(){
                    
                });
            });
        } 

        //Creates a palette from a random image 
        function createRandomPalette(){
            disableInteraction()
            var paletteWait = $.Deferred();
            var myPalette = new Palette.Palette();
            //Unsplash Colours and Patterns collection
            var url = "//source.unsplash.com/collection/175083/400x248";
            //var url = "//lh3.googleusercontent.com/SO4jvgiZlVezRvc9yIoVy-kYL6xmMzPdsKycymYzGr5nZBheBwJKUY24pgfI_lCG28a_-ec934E=w640-h400-e365";
            $.get(url, function(data, status){
                createPaletteFromImage(url).done(function(){
                    enableInteraction()
                    if(paletteCollection.firstLoad == true){
                        paletteCollection.firstLoad = false;
                    }
                    else{
                        $("#undo").attr('class', 'btn');
                        $("#redo").attr('class', 'btn disabled');
                    }
                })            
            });
            return paletteWait.promise();
        }

        function createShuffledPalette(){
            paletteCollection.undoPosition = 1;
            //duplicateLatestPalette();
            var palette = new Palette.Palette();
            palette.colours = getLatestPalette().colours;
            palette.style = getLatestPalette().style;
            palette.image = getLatestPalette().image;
            //shuffle
            var currentIndex = palette.colours.length,
            temporaryValue, randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = palette.colours[currentIndex];
                palette.colours[currentIndex] = palette.colours[randomIndex];
                palette.colours[randomIndex] = temporaryValue;
            }
            paletteCollection.palettes.unshift(palette);
        }

        //Creates a palette from an image and applies it to the map
        function createPaletteFromImage(image){
            paletteCollection.undoPosition = 1;
            disableInteraction()
            var paletteWait = $.Deferred();
            var myPalette = new Palette.Palette();
            if (paletteCollection.palettes.length == paletteCollection.history){
                paletteCollection.palettes.pop();
            }
            paletteCollection.palettes.unshift(myPalette);
            getLatestPalette().generateColours(image).done(function(){
                updateSwatches(getLatestPalette());
                mapController.applyPalette(getLatestPalette());
                paletteWait.resolve();
            });       
                  
            return paletteWait.promise();
        }

        //returns the most recent palette in the collection
        function getLatestPalette(){
            return paletteCollection.palettes[0];
        }

        //creates a new palette and puts it at the front of the collection
        function createNewPalette(){
            var myPalette = new Palette.Palette();
            if (paletteCollection.palettes.length == paletteCollection.history){
                paletteCollection.palettes.pop();
            }
            paletteCollection.palettes.unshift(myPalette);
            //tbc
        }

        //takes a copy of the most recent palette in the collection 
        //this is the best way to make adjustments to a palette, whilst maintaining the undo/redo stack
        function duplicateLatestPalette(){
            if (paletteCollection.palettes.length == paletteCollection.history){
                paletteCollection.palettes.pop();
            }
            paletteCollection.palettes.unshift(new Palette.Palette());
            paletteCollection.palettes[0].colours = paletteCollection.palettes[1].colours;
            paletteCollection.palettes[0].image = paletteCollection.palettes[1].image;
            paletteCollection.palettes[0].style = paletteCollection.palettes[1].style;
        }

        //Updates the colour swatches based on the palette you give it
        function updateSwatches(palette){
            for(colour in palette.colours){
                var c = parseInt(colour)+1;
                $(".swatch:nth-child(" + c + ")").css("background", palette.colours[colour]);
            }
        }

        //function to stop the user breaking the app
        function disableInteraction(){
            $("body").css("pointer-events", "none");
        }

        //function to stop the user breaking the app
        function enableInteraction(){
            $("body").removeAttr("style");
        }

        //sets up the swatch editing UI
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
                        createPaletteFromImage(event.target.result).done(function(){
                            enableInteraction()
                    if(paletteCollection.firstLoad == true){
                        paletteCollection.firstLoad = false;
                    }
                    else{
                        $("#undo").attr('class', 'btn');
                        $("#redo").attr('class', 'btn disabled');
                    }
                        })
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
                    createPaletteFromImage(e.currentTarget.result).done(function(){
                        enableInteraction()
                    if(paletteCollection.firstLoad == true){
                        paletteCollection.firstLoad = false;
                    }
                    else{
                        $("#undo").attr('class', 'btn');
                        $("#redo").attr('class', 'btn disabled');
                    }
                    })
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

     
        //Events ---------------------------------------------------------------------------------------
        $("#shuffle").click(function(){
            disableInteraction()
            //duplicateLatestPalette();
            //console.log(getLatestPalette());
            //getLatestPalette().shuffleColours();
            createShuffledPalette();
            
            //console.log(paletteCollection);
            mapController.applyPalette(getLatestPalette());
            updateSwatches(getLatestPalette());
            enableInteraction()
            if(paletteCollection.firstLoad == true){
                paletteCollection.firstLoad = false;
            }
            else{
                $("#undo").attr('class', 'btn');
                $("#redo").attr('class', 'btn disabled');
            }
            
        });

        $(".random").click(function(){
            createRandomPalette()
        });

        //sets the colour in the swatch editor 
        $("[id^='swatch']").click(function() {
            $("[id^='swatch']").spectrum("set", $(this).css("background"));
            $("[id^='swatch']").css("pointer-events", "none");
        });

        //When the upload button is engaged with, run the function to get the data
        $("#upload").change(function(){
            getImageUpload(this);
        });
        //Undo stuff
        $("#undo").click(function(){
            $("#redo").attr('class', 'btn');
            updateSwatches(paletteCollection.palettes[1]);
            mapController.applyPalette(paletteCollection.palettes[1]);
            var img = document.createElement('img');
            img.setAttribute("src", paletteCollection.palettes[1].image);
            img.addEventListener('load', function () {
                Utils.updateCanvas($(img).attr('src'));
            });
            paletteCollection.palettes.push(paletteCollection.palettes.shift());
            paletteCollection.undoPosition++;
            if (paletteCollection.undoPosition == paletteCollection.palettes.length){
                $("#undo").attr('class', 'btn disabled')
            }
            else{

            }
        });

        //Redo stuff
        $("#redo").click(function(){
            $("#undo").attr('class', 'btn');
            paletteCollection.palettes.unshift(paletteCollection.palettes.pop());
            updateSwatches(paletteCollection.palettes[0]);
            mapController.applyPalette(paletteCollection.palettes[0]);
            var img = document.createElement('img');
            img.setAttribute("src", paletteCollection.palettes[0].image);
            img.addEventListener('load', function () {
                Utils.updateCanvas($(img).attr('src'));
            });
            paletteCollection.undoPosition--; 
            if (paletteCollection.undoPosition == 1){
                $("#redo").attr('class', 'btn disabled')
            }
            else{

            }           
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

        $('#save').click(function () {
            Portal.saveMap(getLatestPalette().style);
            //$('#save > img').hide();
            //$('.sk-circle').show();
            
        });

        

        //Logic ----------------------------------------------------------------------------------------

        initialise();

    });