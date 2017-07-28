define(["modules/color-thief.min"], function() {

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

    //Stuff to make public
    return {
        imageToBase64: imageToBase64,
        imageToColours: imageToColours,
        componentToHex: componentToHex,
        rgbToHex: rgbToHex
    };

});