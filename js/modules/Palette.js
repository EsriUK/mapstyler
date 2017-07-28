define(["modules/Utils"], function(Utils) {

    //Constructor for a new Palette
    var Palette = function (image){
        Utils.imageToBase64(image, function (result) {
            this.colours = Utils.imageToColours(result, 5);
        });
    }
    
    //ready for a function
    Palette.prototype.shuffleColours = function(oldPosition, newPosition){
    }

    //Stuff to make public
    return {
        Palette: Palette
        
    };
});