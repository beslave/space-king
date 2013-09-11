var DISPLAY = function(canvas, SPACE_RADIUS){
    var obj = {};
    obj.FRAME_DELAY = 10;
    obj.width = 0;
    obj.height = 0;
    obj.canvas = canvas;
    obj.context = canvas.getContext('2d');
    obj.fon = new Image();
    obj.fon.src = "/static/css/images/main_background.jpeg";

    obj.event_handlers = [
        "onclick",
        "onloop",
        "onkeyup",
        "onkeydown"
    ];
    obj.resetHandlers = function(handler){
        for(var i=0; i<this.event_handlers.length; i++){
            var x = this.event_handlers[i];
            if(handler && handler[x]) this[x] = handler[x];
            else this[x] = null;
            if(x != "onloop") window[x] = this[x];
        }
    };

    obj.setWidth = function(width){
        this.canvas.width = width;
        this.canvas.style.width = width;
    };
    obj.setHeight = function(height){
        this.canvas.height = height;
        this.canvas.style.height = height;
    };
    obj.loop = function(){
        if(this.onloop) this.onloop();
        setTimeout(function(){ obj.loop(); }, this.FRAME_DELAY);
    };
    obj.setHandler = function(handler){
        this.resetHandlers(handler);
    };
    return obj;
};