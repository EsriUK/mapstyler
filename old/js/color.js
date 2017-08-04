require([
		"esri/Map",
        "esri/views/MapView",
        "esri/layers/VectorTileLayer",
        "dojo/domReady!"
],
    function (Map, MapView, VectorTileLayer) {

        //Proxy information to avoid CORS issues with ColorLOVERS API call - you will need to change this	
        var href = document.location.href;
        var proxyUrl = href.substr(0, href.indexOf('wmt') + 3) + "/proxy?";

		 //Define globals
        var map			= new Map();
        var item		= "https://arcgis.com/sharing/rest/content/items/5ad3948260a147a993ef4865e3fad476";
		var paletteName = '';
        
		 //Create a new map view and assign to the viewDiv in color.html
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

		$('#viewDiv').css('opacity', '1');

        tileLyr.on("layerview-create", function (evt) {
            layerView = evt.layerView;
        
			//Set the original JSON style as a variable. We will need to revert to this each time we update the map's style
            originalStyle = JSON.stringify(layerView.layer.styleRepository.styleJSON);
			
			//Call the refreshColors function.
			refreshColors();
           
        });

		//Function that get a JSON file from the Color Lovers API
		function refreshColors() {

			$.getJSON(proxyUrl+ "http://www.colourlovers.com/api/palettes/random?keywords=evil&jsonCallback=?", function (colors, status, xhr) {
					
			    paletteName = colors[0].title;
			    itemName = paletteName;

				if (colors[0].colors.length === 5) {
				
					var colours = [];
					
					$.each(colors, function(index, col) {
						if (index == 2) marker.css('color', '#' + col.hex);
						colours.push('#' + col.colors[0].toLowerCase());
						colours.push('#' + col.colors[1].toLowerCase());
						colours.push('#' + col.colors[2].toLowerCase());
						colours.push('#' + col.colors[3].toLowerCase());
						colours.push('#' + col.colors[4].toLowerCase());
					});

					updateDisplay(colours);

				} else {

					refreshColors();

				}

			});
		}

        //Updates colour palette info panel and map style
		function updateDisplay(colours) {
            $('.palette input.pal1').val(colours[0]);
			$('.palette input.pal2').val(colours[1]);
			$('.palette input.pal3').val(colours[2]);
			$('.palette input.pal4').val(colours[3]);
			$('.palette input.pal5').val(colours[4]);

			$('.demo').each(function () {
				$(this).minicolors({
				change: function() {
					    $('#apply').show();
		        },
		            position: 'top right',
		        });
		    });

			map.remove(tileLyr);
		    //Generate new style file
			newStyle = styleSwitch(colours);
            //Create new tile layer using new style and add to map
            tileLyr = new VectorTileLayer({
			    url: newStyle
			})

			map.add(tileLyr);
		}
        
		//Fires when the apply button is hit. Applies the currently selected colour ramp to the Canvas
		$("#apply").on("click", function () {

			$('#save > img').attr("src","img/heart-shape-outline.svg");

			var colours = [];

			$('.demo').each( function() {
			    colours.push($(this).val());
			});
            updateDisplay(colours);
			
		});

		//Fires when the random button is hit. Changes the icon src, Destroys the minicolors plugin, then calls the refreshColors function.
		$("#random").on("click", function () {

		    $('#save > img').attr("src", "img/heart-shape-outline.svg");

		    $('.demo').each(function () {
		        $(this).minicolors('destroy', function(){
		        });
		    }); 

			refreshColors();

		});

		//Displays a help dialogue with information on the app
		$("#help").click(function () {
		    $('#modal,.overlay').css("display", "block");
		});

		//Closes the help dialogue
		$(".close, .overlay").click(function () {
		    $('#modal,.overlay').css("display", "none");
		});

});