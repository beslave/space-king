var DISPLAY = function(SPACE_RADIUS){
    var obj = {};
    obj.messages = [];

    obj.event_handlers = [
        "onclick",
        "onloop",
        "onkeyup",
        "onkeydown",
        "onmousemove"
    ];
    obj.resetHandlers = function(handler){
        this.overlay.width = this.overlay.width;
        this.buffer.width = this.buffer.width;
        this.canvas.width = this.canvas.width;
        this.messages = [];
        this.container.style.backgroundPositionX = "center";
        this.container.style.backgroundPositionY = "center";
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
        this.overlay = document.getElementById("overlay");
        this.ocontext = this.overlay.getContext("2d");
        this.container = document.getElementById("display");
    };
    obj.init();

    obj.playGame = function(){
        this.resetHandlers(GAME(this));
    };
    obj.showMenu = function(){
        this.resetHandlers(MENU(this));
    };

    obj.setSize = function(attr, size){
        this.canvas[attr] = size;
        this.buffer[attr] = size;
        this.overlay[attr] = size;
        if(this.handler) this.handler.is_unchanged = false;
    };
    obj.setWidth = function(width){
        this.setSize('width', width);
    };
    obj.setHeight = function(height){
        this.setSize('height', height);
    };
    obj.loop = function(){
        if(!this.handler) return;
        if(!this.handler.is_unchanged && this.onloop && !this.in_work){
            this.handler.is_unchanged = true;
            this.in_work = true;
            this.onloop();
            this.in_work = false;
            this.showMessages();
        }
        this.updateMessages();
    };
    obj.setHandler = function(handler){
        this.resetHandlers(handler);
    };

    obj.updateMessages = function(){
        var cur_time = new Date().getTime();
        for(var i = this.messages.length - 1, j = 0; i >= 0; i--, j++){
            if(cur_time - this.messages[i].time > MESSAGE_SHOWING_TIME){
                if(this.handler) this.handler.is_unchanged = false;
                this.messages.splice(i, 1);
            }
        }        
    }

    obj.showMessages = function(){
        for(var i = this.messages.length - 1, j = 0; i >= 0; i--, j++){
            this.messages[i].draw(this.context, 10, 10 + j * 36);
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