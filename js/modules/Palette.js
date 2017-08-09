define(["modules/Utils"], function(Utils) {

    //Constructor for a new Palette
    var Palette = function (){
        this.image = "";
        this.colours = "";
    }

    Palette.prototype.generateColours = function(image) {
        var paletteWait = $.Deferred();
        var that = this;
        this.image = image;
        if (image.startsWith("data")) {
            Utils.imageToColours(image, 5).done(function(result) {
                that.colours = result;
                paletteWait.resolve();
            });
        } else {
            Utils.imageToBase64(image, function(result) {
                Utils.imageToColours(result, 5).done(function(result) {
                    that.colours = result;
                    paletteWait.resolve();
                });
            });
        }
        return paletteWait.promise();
    }
    
    //ready for a function
    Palette.prototype.moveColour = function(oldPosition, newPosition){
    }

    //radomises the order of the colours in the palette
    Palette.prototype.shuffleColours = function(){
        var that = this;
        var currentIndex = that.colours.length,
            temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = that.colours[currentIndex];
            that.colours[currentIndex] = that.colours[randomIndex];
            that.colours[randomIndex] = temporaryValue;
        }
    }

    //updates an individual colour in a palette
    Palette.prototype.updateColour = function(position, newColour){
        var that = this; 
        that.colours[position] = newColour;
    }

    //Stuff to make public
    return {
        Palette: Palette
        
    };
});