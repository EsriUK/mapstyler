require([
		"esri/Map",
        "esri/views/MapView",
        "esri/layers/VectorTileLayer",
        "dojo/domReady!"
],
    function (Map, MapView, VectorTileLayer) {

		//Proxy information to avoid CORS issues with images dragged from other browser windows - you will need to change this	
		var href		= document.location.href;
        var proxyUrl	= href.substr(0, href.indexOf('wmt') + 3) + "/proxy?";

        //Define globals
        var map = new Map();
        var run			= false;
        var colours		= [];
        var canvas		= document.getElementById("c");
        var ctx			= canvas.getContext("2d");
        //Esri's dark gray canvas vector tile layer - the base layer for the app
        var item =      "https://arcgis.com/sharing/rest/content/items/5ad3948260a147a993ef4865e3fad476";
        
        //Create a new map view and assign to the viewDiv in image.html
		var view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 13,
            center: [-0.010557, 51.495997]
        });
        //Create new vector tile layer using the root style of the item defined above
		var tileLyr = new VectorTileLayer({
            url: item + "/resources/styles/root.json"
        });
        
		map.add(tileLyr);

        tileLyr.on("layerview-create", function (evt) {
            
			layerView = evt.layerView;
            
			if (run == false) {
                //Set the original JSON style as a variable. We will need to revert to this each time we update the map's style
                originalStyle = JSON.stringify(layerView.layer.styleRepository.styleJSON);
            }

        });

        //Function to prepare the image data for processing
		function prepareImage(data) {
		    if (data.startsWith("data:image")) {
		        var img = document.createElement('img');
		        img.setAttribute("src", data);
		        img.addEventListener('load', function () {
		            processImage(img);
		            updateCanvas(data);
		        });
		    }
		    else {
		        alert("Unsupported file type")
		    }
		}
        //Function to get colours from the supplied image using ColorThief - https://github.com/lokesh/color-thief
        function processImage(img) {
            var colorThief = new ColorThief();
            //Request ColorThief to return a palette of five colours from the image that we can use to update the map's style
            var colorThiefColors = colorThief.getPalette(img, 5);
            for (var colors in colorThiefColors) {
                colours[colors] = rgbToHex(colorThiefColors[colors][0], colorThiefColors[colors][1], colorThiefColors[colors][2]);
            }
            //Now we have an image, display the shuffle button
            $("#shuffle").show();
            //Remove original layer
            map.remove(tileLyr);
            //Generate new style file
            newStyle = styleSwitch(colours);
            //Create new tile layer using new style and add to map            
            tileLyr = new VectorTileLayer({
                url: newStyle
            })
            map.add(tileLyr);

            if (run == false) {
                run = true;
                $('.card').addClass('active');
                $('.intro').hide();
                $('canvas').show();
                $('#save').show();
            }
        }

        //Function to display the supplied image to the user in a HTML5 canvas element
        function updateCanvas(imagesrc) {
            var image = new Image();
            image.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                var wrh = image.width / image.height;
                var newWidth = canvas.width;
                var newHeight = newWidth / wrh;
                if (newHeight > canvas.height) {
                    newHeight = canvas.height;
                    newWidth = newHeight * wrh;
                }
                offset = 0;
                if (newWidth < 300) {
                    offset = canvas.width - newWidth;
                }
                ctx.drawImage(image, offset, 0, newWidth, newHeight);
            };
            image.src = imagesrc;
        }

 
        //Function for converting component colour values to hex
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        //Function to convert RGB colour value to hex
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        //Function to convert image URLs to base64
        function toDataUrl(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var reader = new FileReader();
                reader.onloadend = function () {
                    callback(reader.result);
                }
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', proxyUrl + url);
            xhr.responseType = 'blob';
            xhr.send();
        }

        //Function to shuffle the array containing colours from the supplied image so we can change what colours are used for what elemets of the map
        //Taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        function shuffleArray(array) {

            var currentIndex = array.length,
                temporaryValue, randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }
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
                        prepareImage(event.target.result)
                    }, this, file, $("#fileList"));
                    reader.readAsDataURL(file);
                });

            } else {
                var imagepath	= dataTransfer.getData('text/html');
		//Get the URL to the image using a regular expression (fixes issue on Macs if you try and use the jquery .attr method)
                var imagesrc	= imagepath.match(new RegExp('src="' + '(.*)' + '"'))[1].split('"')[0];
                //If image is already in base64, sed straight to the prepareimage function...
				if (imagesrc.startsWith("data")) {
                    prepareImage(imagesrc);
				} else {
                    //...otherwise send to function to convert image to base64 before sending to the prepareimage function
                    toDataUrl(imagesrc, function (result) {
                        prepareImage(result)
                    });
                }

            }
        }

        //Fires when the shuffle button is hit. Shuffles the image-derived colour palette to apply colours to different map elements
        $("#shuffle").click(function () {
			$('#save > img').attr("src","img/heart-shape-outline.svg");
			shuffleArray(colours);
			//Remove original layer
            map.remove(tileLyr);
            //Generate new style file
            newStyle = styleSwitch(colours);
            //Create new tile layer using new style and add to map
            tileLyr = new VectorTileLayer({
                url: newStyle
            })
            map.add(tileLyr);
        });
        //Displays a help dialogue with information on the app
        $("#help").click(function () {
            $('#modal,.overlay').css("display", "block");
        });
        //Closes the help dialogue
        $(".close, .overlay").click(function () {
            $('#modal,.overlay').css("display", "none");
        });
        //UI stuff
        $('.intro').show();
        $('canvas').hide();

    });
