var MESSAGE_SHOWING_TIME = 15 * 1000;
var FRAME_DELAY = 10;


var DISPLAY = function(canvas, SPACE_RADIUS){
    var obj = {};
    obj.width = 0;
    obj.height = 0;
    obj.canvas = canvas;
    obj.context = canvas.getContext('2d');
    obj.fon = new Image();
    obj.fon.src = "/static/css/images/main_background.jpeg";
    obj.messages = [];

    obj.event_handlers = [
        "onclick",
        "onloop",
        "onkeyup",
        "onkeydown",
        "onmousemove"
    ];
    obj.resetHandlers = function(handler){
        this.messages = [];
        for(var i=0; i<this.event_handlers.length; i++){
            var x = this.event_handlers[i];
            if(handler && handler[x]) this[x] = handler[x];
            else this[x] = null;
            if(x != "onloop") window[x] = this[x];
        }
        if(this.handler){
            this.handler.close();
            delete this.handler;
        }
        this.handler = handler;
    };
    obj.playGame = function(){
        this.resetHandlers(GAME(this));
    };
    obj.showMenu = function(){
        this.resetHandlers(MENU(this));
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
        this.showMessages();
        setTimeout(function(){ obj.loop(); }, FRAME_DELAY);
    };
    obj.setHandler = function(handler){
        this.resetHandlers(handler);
    };

    obj.showMessages = function(){
        var cur_time = new Date().getTime();
        this.context.translate(0, 0);
        for(var i = this.messages.length - 1, j = 0; i >= 0; i--, j++){
            if(cur_time - this.messages[i].time > MESSAGE_SHOWING_TIME) this.messages.splice(i, 1);
            else this.messages[i].draw(this.context, 10, 10 + j * 36);
        }
    };
    obj.addErrorMessage = function(msg){
        this.messages.push(Message(msg, "error"));
    };
    obj.addWarningMessage = function(msg){
        this.messages.push(Message(msg, "warning"));
    };
    obj.addInfoMessage = function(msg){
        this.messages.push(Message(msg, "info"));
    };
    return obj;
};