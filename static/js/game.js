function GAME(DISPLAY){
    var obj = {};
    obj.display = DISPLAY;
    obj.fon = DISPLAY.fon;
    obj.lc = 0;     // loop counter
    obj.canvas = DISPLAY.canvas;
    obj.context = DISPLAY.context;
    obj.SPACE_RADIUS = DISPLAY.SPACE_RADIUS || 1000;

    // 0 - SELF SHIP PARAMS LOADING
    // 1 - OTHER OBJECTS LOADING
    // 2 - POSITION REFRESHING
    obj.GAME_STATE = 0;
    
    obj.players = [null, null];
    obj.map_size = 240;
    obj.bcanvas = document.createElement("canvas");
    obj.bcanvas.width = SPACE_RADIUS * 2;
    obj.bcanvas.height = SPACE_RADIUS * 2;
    obj.bcontext = obj.bcanvas.getContext('2d');
    obj.mapcanvas = document.createElement('canvas');
    obj.mapcontext = obj.mapcanvas.getContext('2d');

    obj.socket = new WebSocket(SOCKET_URL);
    obj.socket.onopen = function(){
        log("socket open");
    };
    obj.socket.onclose = function(event){
        obj.display.showMenu();
        obj.display.addErrorMessage("Connection is lost. The game has been interrupted.");
    };
    obj.socket.onmessage = function(event){
        var data = $.parseJSON(event.data);
        if(obj.GAME_STATE == 0){
            obj.players[0] = Ship(data, obj);
            obj.GAME_STATE = 1;
        } else if(obj.GAME_STATE == 1){
            obj.players[1] = Ship(data, obj);
            obj.GAME_STATE = 2;
        } else if(obj.GAME_STATE == 2){
            for(var i=0; i < data.length; i++){
                for(var key in data[i]) obj.players[i][key] = data[i][key];
            }
        }
    };
    obj.socket.onerror = function(error){
        log("socket error:", error);
    };

    obj.notify = function(command){
        this.socket.send(command);
    }


    obj.onkeydown = function(e){
        if(obj.players[0]){
            if(e.keyCode == 38 || e.keyCode == 87) obj.players[0].forward(true);
            else if(e.keyCode == 40 || e.keyCode == 83) obj.players[0].backward(true);
            else if(e.keyCode == 37 || e.keyCode == 65) obj.players[0].left(true);
            else if(e.keyCode == 39 || e.keyCode == 68) obj.players[0].right(true);
        }
    };

    obj.onkeyup = function(e){
        if(obj.players[0]){
            if(e.keyCode == 38 || e.keyCode == 87) obj.players[0].forward(false);
            else if(e.keyCode == 40 || e.keyCode == 83) obj.players[0].backward(false);
            else if(e.keyCode == 37 || e.keyCode == 65) obj.players[0].left(false);
            else if(e.keyCode == 39 || e.keyCode == 68) obj.players[0].right(false);
        }
    };

    obj.wait = function(){
        this.prepareContext();
        this.context.font = "30px Calibri";
        this.context.fillStyle = "yellow";
        this.context.textAlign = "left";
        this.context.textBaseline = "middle";
        var text = "Waiting for second player ";
        var m = this.context.measureText(text);
        text += Array(parseInt(this.lc/5 % 25)).join(".");
        this.context.fillText(text, Math.max(-this.canvas.width/2 + 5, -m.width), 0);
        this.endDrawing();
    };
    obj.draw = function(){
        var pos = this.getPosition();
        this.prepareBuffer();
        this.drawBackground(pos.x, pos.y);
        this.drawArea();
        this.drawObjects();            
        this.drawMap();
        this.showMap(pos.x, pos.y);
        this.prepareContext();
        this.showBuffer(pos.x, pos.y);
        this.endDrawing();
    };
    obj.getPosition = function(){
        var x = this.players[0].x  + this.SPACE_RADIUS - this.canvas.width / 2;
        var y = this.players[0].y  + this.SPACE_RADIUS - this.canvas.height / 2;
        if(x < 0) x = 0;
        if(x > this.SPACE_RADIUS * 2 - this.canvas.width)
            x = this.SPACE_RADIUS * 2 - this.canvas.width;
        if(y < 0) y = 0;
        if(y > this.SPACE_RADIUS * 2 - this.canvas.height)
            y = this.SPACE_RADIUS * 2 - this.canvas.height;
        return {
            x: x,
            y: y
        };
    };
    obj.prepareBuffer = function(){
        this.bcanvas.width = this.bcanvas.width;
        this.bcontext.translate(this.SPACE_RADIUS, this.SPACE_RADIUS);
    };
    obj.drawBackground = function(x, y){
        var k = Math.max(this.bcanvas.width / this.fon.width,
                         this.bcanvas.height / this.fon.height);
        var f_width = this.fon.width * k;
        var f_height = this.fon.height * k;
        var ix = (f_width - this.bcanvas.width) / (2.0 * k) + x / k;
        var iy = (f_height - this.bcanvas.height) / (2.0 * k) + y / k;
        var iw = this.canvas.width / k;
        var ih = this.canvas.height / k;
        this.bcontext.drawImage(
            this.fon, ix, iy, iw, ih,
            x - this.bcanvas.width / 2, y - this.bcanvas.height / 2,
            this.canvas.width, this.canvas.height
        );
    };
    obj.drawArea = function(){
        this.bcontext.strokeStyle = "#F00";
        this.bcontext.lineWidth = this.SPACE_RADIUS * 0.01;
        this.bcontext.beginPath();
        this.bcontext.arc(0, 0, this.SPACE_RADIUS - this.bcontext.lineWidth/2, Math.PI * 2, false);
        this.bcontext.closePath();
        this.bcontext.stroke();
    };
    obj.drawObjects = function(){
        for(var i = 0; i < 2; i++) this.players[i].draw(this.bcontext);
    };
    obj.drawMap = function(){
        this.mapcanvas.width = this.map_size;
        this.mapcanvas.height = this.map_size;
        this.mapcontext.translate(this.map_size/2, this.map_size/2);
        this.mapcontext.fillStyle = "rgba(200,224,127,0.4)";
        this.mapcontext.strokeStyle = "rgba(255,0,0,0.4)";
        this.mapcontext.lineWidth = this.map_size * 0.02;
        this.mapcontext.beginPath();
        this.mapcontext.arc(0, 0, (this.map_size - this.mapcontext.lineWidth) / 2, Math.PI * 2, false);
        this.mapcontext.closePath();
        this.mapcontext.fill();
        this.mapcontext.stroke();
        this.mapcontext.lineWidth = this.map_size * 0.03;
        for(var i = 0; i < 2; i++){
            if(i == 0){
                this.mapcontext.fillStyle = "rgba(255,255,127,0.5)";
                this.mapcontext.strokeStyle = "rgba(196,255,63,0.3)";
            }
            else{
                this.mapcontext.fillStyle = "rgba(255,127,127,0.5)";
                this.mapcontext.strokeStyle = "rgba(255,127,63,0.3)";
            }
            this.mapcontext.beginPath();
            this.mapcontext.arc(
                this.players[i].x * this.map_size / this.bcanvas.width,
                this.players[i].y * this.map_size / this.bcanvas.height,
                this.map_size * this.players[i].radius / this.SPACE_RADIUS * 0.5,
                Math.PI * 2, false);
            this.mapcontext.closePath();
            this.mapcontext.fill();
            this.mapcontext.stroke();
        }
    };
    obj.showMap = function(x, y){
        this.bcontext.translate(x, y);
        var mx = this.canvas.width - this.map_size - this.bcanvas.width / 2;
        var my = this.canvas.height - this.map_size - this.bcanvas.height / 2;
        if(this.players[0].rotation != 0)
            mx -= this.canvas.width - this.map_size;
        if(this.players[0].rotation != 0)
            my -= this.canvas.height - this.map_size;
        this.bcontext.drawImage(
            this.mapcanvas,
            0, 0, this.map_size, this.map_size,
            mx, my, this.map_size, this.map_size
        );
    };
    obj.prepareContext = function(){
        this.canvas.width = this.canvas.width;
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
    };
    obj.showBuffer = function(x, y){
        this.context.rotate(-this.players[0].rotation);
        this.context.drawImage(
            this.bcanvas,
            x, y, this.canvas.width, this.canvas.height,
            - this.canvas.width / 2, - this.canvas.height / 2,
            this.canvas.width, this.canvas.height
        );
        this.context.rotate(this.players[0].rotation);
    };
    obj.endDrawing = function(){
        this.context.translate(0, 0);
    };
    obj.win = function(){
        this.socket.onmessage = null;
        this.socket.close();
        obj.display.showMenu();
        obj.display.addInfoMessage("You win!");
    };
    obj.lose = function(){
        this.socket.onmessage = null;
        this.socket.close();
        obj.display.showMenu();
        obj.display.addErrorMessage("You lose!");
    };
    obj.onloop = function(){
        if(obj.players[0] && obj.players[1]){
            obj.draw();
            if(obj.players[0].win) obj.win();
            if(obj.players[0].lose) obj.lose();
        } else obj.wait();
        obj.lc++;
    }
    check_performance("Game drawing", obj, [
        "start",
        "draw",
        "getPosition",
        "prepareBuffer",
        "drawBackground",
        "drawArea",
        "drawObjects",
        "drawMap",
        "showMap",
        "prepareContext",
        "showBuffer"
    ]);
    return obj;
};