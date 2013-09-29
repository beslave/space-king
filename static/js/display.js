var DISPLAY = function(SPACE_RADIUS){
    var obj = {};
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

    obj.init = function(){
        this.canvas = document.getElementById("gameID");
        this.context = this.canvas.getContext("2d");
        this.buffer = document.getElementById(FLIPPING ? "gameBuffer" : "gameID");
        this.bcontext = this.buffer.getContext("2d");
    };
    obj.init();

    obj.playGame = function(){
        if(this.fon.complete) this.resetHandlers(GAME(this));
        else this.addWarningMessage(NOT_ALL_DATA_LOADED);
    };
    obj.showMenu = function(){
        this.resetHandlers(MENU(this));
    };

    obj.setWidth = function(width){
        this.canvas.width = width;
        this.buffer.width = width;
    };
    obj.setHeight = function(height){
        this.canvas.height = height;
        this.buffer.height = height;
    };
    obj.loop = function(){
        setTimeout(function(){ obj.loop(); }, FRAME_DELAY);
        if(this.onloop && !this.in_work){
            this.in_work = true;
            this.onloop();
            this.in_work = false;
        }
        this.showMessages();
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
    obj.flip = function(){
        var tid = this.canvas.id;
        this.canvas.id = this.buffer.id;
        this.buffer.id = tid;
        this.init();
    };
    return obj;
};