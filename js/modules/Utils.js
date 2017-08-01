//The Utils module contains all the functions that are used by, 
//but do not directly affect the MapController or Palette

define(["modules/color-thief.min", "modules/rainbowvis"], function() {

    //Function to convert image URLs to base64
    var imageToBase64 = function(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    var imageToColours = function(image, numberOfColours){
        var dfd = $.Deferred();
        if (image.startsWith("data:image")) {
            
            var img = document.createElement('img');
            img.setAttribute("src", image);
            img.addEventListener('load', function () {
                //Update the canvas to display the image preview
                //updateCanvas($(img).attr('src'));
                var colorThief = new ColorThief();
                //Request ColorThief to return a palette of five colours from the image that we can use to update the map's style
                var colorThiefColors = colorThief.getPalette(img, numberOfColours);
                for (var colors in colorThiefColors) {
                    colorThiefColors[colors] = rgbToHex(colorThiefColors[colors][0], colorThiefColors[colors][1], colorThiefColors[colors][2]);
                }
                dfd.resolve(colorThiefColors);
            });
        }
        else {
            alert("Unsupported file type")
        }
        return dfd.promise();
    }

    var updateCanvas = function (imagesrc) {
        var canvas = document.getElementById("c");
        var ctx	= canvas.getContext("2d");
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
    var componentToHex = function (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    //Function to convert RGB colour value to hex
    var rgbToHex = function (r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    //Function to do a find and replace in the style JSON to replace original colour values with new ones
    function stringReplace(str, replaceWhat, replaceTo) {
        replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var re = new RegExp(replaceWhat, 'gi');
        return str.replace(re, replaceTo);
    }

    //Generate a colour ramp between two colours using RainbowVIS-JS - https://github.com/anomal/RainbowVis-JS
    function getColourRamp(first, last) {
        var array = getBaseColourArray();
        //Use the number of colours in the dark gray canvas vector tile colour array to define how many colours in the generated colour ramp
        var numberOfItems = array.length;
        var rainbow = new Rainbow();
        rainbow.setNumberRange(1, numberOfItems);
        rainbow.setSpectrum(first, last);
        var dict = [];
        for (var i = 1; i <= numberOfItems; i++) {
            dict[array[i - 1]] = "#" + rainbow.colourAt(i).toUpperCase();
        }
        return dict;
    }

    function getBaseColourArray(){
        var array = ["#222326", "#222426", "#2d2c2e", "#323133", "#373638", "#3b3a3c", "#3f3e40",
           "#414042", "#424143", "#464748", "#474648", "#4a494b", "#494b4a", "#49484a", "#4e4d4f",
           "#59585a", "#5a595b", "#5b5a5c", "#5d5c5e", "#5f5e60", "#666666", "#6e6d6f", "#787779",
           "#828282", "#808781", "#868587", "#939294", "#969696", "#99989a", "#9c9c9c", "#a2a2a6",
           "#abaaac", "#aeadaf", "#cfcfd4", "#dddcde", "#f5f2dc", "#fdfdfd", "#ffffff"
        ];
        return array;
    }

    //Stuff to make public
    return {
        imageToBase64: imageToBase64,
        imageToColours: imageToColours,
        componentToHex: componentToHex,
        rgbToHex: rgbToHex,
        stringReplace: stringReplace,
        getColourRamp: getColourRamp,
        getBaseColourArray: getBaseColourArray
    };

});