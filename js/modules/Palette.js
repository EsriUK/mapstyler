define(["modules/Utils"], function(Utils) {

    //Constructor for a new Palette
    var Palette = function (diy){
        this.image = "";
        this.colours = "";
        this.diy = diy; //Boolean - is the DIY mode enabled? 
    }

    Palette.prototype.generateColours = function(image) {
        var paletteWait = $.Deferred();
        var that = this;
        this.image = image;
        if (image.startsWith("data")) {
            Utils.imageToColours(image, 5).done(function(result) {
                if (result == "error"){
                    paletteWait.resolve("error");                    
                }
                else{
                    that.colours = result;
                    paletteWait.resolve("success");
                }

            });
        } else {
            Utils.imageToBase64(image, function(result) {
                that.image = result;
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
        var currentIndex = this.colours.length,
            temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.colours[currentIndex];
            this.colours[currentIndex] = this.colours[randomIndex];
            this.colours[randomIndex] = temporaryValue;
        }
        this.colours = Math.random();
        console.log(this);
    }

    //updates an individual colour in a palette
    Palette.prototype.updateColour = function(position, newColour){
        var that = this; 
        that.colours[position] = newColour;
    }

    //store the new style in the palette
    Palette.prototype.storeStyle = function(style){
        this.style = style;
    }

    Palette.prototype.isDiy = function(){
        return this.diy;
    }

    Palette.prototype.setDiy = function(diy){
        this.diy = diy;
    }

    //Stuff to make public
    return {
        Palette: Palette
    };
});