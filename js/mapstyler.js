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
        paletteCollection.history = 10; //number of palletes to store for the undo stack
        paletteCollection.undoPosition = 1;      

        //Functions  -----------------------------------------------------------------------------------

        //Build the map and generate a palette from a random image
        function initialise(){
            mapController.buildMap().done(function () {
                Portal.initPortal();
                createRandomPalette().done(function(){                  
                });
            });
        } 

        //Creates a palette from a random image 
        function createRandomPalette(){
            disableInteraction()

            //Get a random image from the samples folder
            var rand = Math.floor(Math.random() * 50) + 1 ;
            var url = "img/samples/" + rand + ".jpg"
            
            createPaletteFromImage(url).done(function(){
                enableInteraction()
            }) 
        }

        function createShuffledPalette(){
            $("a#save").attr('class', 'btn')  
            $('a#save').text('SAVE');                            
            paletteCollection.undoPosition = 1;
            duplicateLatestPalette();
            var palette = getLatestPalette();
    
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
        }

        //Creates a palette from an image and applies it to the map
        function createPaletteFromImage(image){
            //Ben to do stuff
            $("a#save").attr('class', 'btn')  
            $('a#save').text('SAVE');                                        
            paletteCollection.undoPosition = 1;
            disableInteraction()
            var paletteWait = $.Deferred();
            var myPalette = new Palette.Palette(false);
            paletteCollection.palettes.unshift(myPalette);
            getLatestPalette().generateColours(image).done(function(result){
                var latestPalette = getLatestPalette();
                if (result == "error" || latestPalette.colours == null){
                    paletteCollection.palettes.shift();                    
                    alert("Unsupported file")
                    paletteWait.resolve("error");
                }
                else{
                    if(paletteCollection.firstLoad == true){
                        paletteCollection.firstLoad = false;
                    }
                    else{
                        $("#undo").attr('class', 'btn');
                        $("#redo").attr('class', 'btn disabled');
                    }
                    if (paletteCollection.palettes.length == paletteCollection.history){
                        paletteCollection.palettes.pop();
                    }
                    updateSwatches(getLatestPalette());
                    mapController.applyPalette(getLatestPalette());
                    $("#diy").css("display",  "none");
                    paletteWait.resolve();
                }
            });       
                  
            return paletteWait.promise();
        }

        //returns the most recent palette in the collection
        function getLatestPalette(){
            return paletteCollection.palettes[0];
        }

        //creates a new palette and puts it at the front of the collection
        function createNewPalette(diy){
            var myPalette = new Palette.Palette(diy);
            if (paletteCollection.palettes.length == paletteCollection.history){
                paletteCollection.palettes.pop();
            }
            paletteCollection.palettes.unshift(myPalette);
            //tbc
        }

        //takes a copy of the most recent palette in the collection 
        //this is the best way to make adjustments to a palette, whilst maintaining the undo/redo stack
        function duplicateLatestPalette(){
            if(paletteCollection.firstLoad == true){
                paletteCollection.firstLoad = false;
            }
            else{
                $("#undo").attr('class', 'btn');
                $("#redo").attr('class', 'btn disabled');
            }
            if (paletteCollection.palettes.length == paletteCollection.history){
                paletteCollection.palettes.pop();
            }
            paletteCollection.palettes.unshift(new Palette.Palette(getLatestPalette().isDiy()));

            //We have to use .toString here to break the referernce to the original data
            var c = paletteCollection.palettes[1].colours.toString();
            var i = paletteCollection.palettes[1].image.toString();
            var s = paletteCollection.palettes[1].style.toString();

            paletteCollection.palettes[0].colours = c.split(',');
            paletteCollection.palettes[0].image = i.split(',');
            paletteCollection.palettes[0].style = s.split(',');
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
            $("#loadingDiv").css("display", "block");
        }

        //function to stop the user breaking the app
        function enableInteraction(){
            $("body").css("pointer-events", "auto");
            $("#loadingDiv").css("display", "none");
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
                //Display DIY mode
                getLatestPalette().setDiy(true);
                $("#diy").css("display",  "block");
                mapController.applyPalette(getLatestPalette());
                $("[id^='swatch']").css("pointer-events", "auto");
            },
            hide: function(color) {
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
            if(paletteCollection.palettes[1].isDiy() == true){
                $("#diy").css("display",  "block");
            } else {
                $("#diy").css("display",  "none");
            }
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
            if(paletteCollection.palettes[0].isDiy() == true){
                $("#diy").css("display",  "block");
            } else {
                $("#diy").css("display",  "none");
            }
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
            $('a#save').text('SAVING');   
            $("a#save").attr('class', 'btn disabled')         
            Portal.saveMap(getLatestPalette().style).done(function(result){
                if(result == "error"){
                    $('a#save').text('SAVE');
                    $("a#save").attr('class', 'btn')  
                    Portal.initPortal();                    
                }
                else{
                    $('a#save').text('SAVED!');                                    
                }
            });
            //$('#save > img').hide();
            //$('.sk-circle').show();
            
        });

        

        //Logic ----------------------------------------------------------------------------------------

        initialise();

    });



    // ---------- PREVENT SCROLLING ON MOBILE DEVICES ------------
      document.ontouchmove = function(event) {
          event.preventDefault();
      }