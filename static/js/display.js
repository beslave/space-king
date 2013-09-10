var DISPLAY = {
    width: 0,
    height: 0,
    canvas: document.getElementById('gameID'),
    context: document.getElementById('gameID').getContext('2d'),

    onLoop = null,
    onKeyUp = null,
    onKeyDown = null,

    setWidth = function(width){
        canvas.width = width;
        canvas.style.width = width;
    },
    setHeight = function(height){
        canvas.height = height;
        canvas.style.height = height;
    }
};