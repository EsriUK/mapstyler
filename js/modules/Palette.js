define(["modules/Utils"], function(Utils) {

    //Constructor for a new Palette
    var Palette = function (){
        this.image = "";
        this.colours = "";
    }

    Palette.prototype.generateColours = function(image){
        var paletteWait = $.Deferred();
        this.image = image;
        Utils.imageToBase64(image, function (result) {
            Utils.imageToColours(result, 5).done(function(result){
                paletteWait.resolve(result);
            });
        });
        return paletteWait.promise();
    }

    Palette.prototype.setColours = function(colours){
        this.colours = colours;
    }

    
    //ready for a function
    Palette.prototype.shuffleColours = function(oldPosition, newPosition){
    }

    //Stuff to make public
    return {
        Palette: Palette
        
    };
});