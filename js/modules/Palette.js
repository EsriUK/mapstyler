define(["modules/Utils"], function(Utils) {

    //Constructor for a new Palette
    var Palette = function (){
        this.image = "";
        this.colours = "";
    }

    Palette.prototype.generateColours = function(image){
        var paletteWait = $.Deferred();
        var that = this;
        this.image = image;
        Utils.imageToBase64(image, function (result) {
            Utils.imageToColours(result, 5).done(function(result){
                that.colours = result;
                paletteWait.resolve();
            });
        });
        return paletteWait.promise();
    }

    
    //ready for a function
    Palette.prototype.shuffleColours = function(oldPosition, newPosition){
    }

    //ready for a function
    Palette.prototype.updateColour = function(position, newColour){
    }

    //Stuff to make public
    return {
        Palette: Palette
        
    };
});