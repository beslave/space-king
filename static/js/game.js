function GAME(canvas, fon, SPACE_RADIUS){
    var obj = {};
    obj.fon = fon;
    obj.canvas = canvas;
    obj.context = canvas.getContext("2d")
    obj.SPACE_RADIUS = SPACE_RADIUS || 1000;

    // 0 - SELF SHIP PARAMS LOADING
    // 1 - OTHER OBJECTS LOADING
    // 2 - POSITION REFRESHING
    obj.GAME_STATE = 0;
    
    obj.players = [null, null];
    obj.map_size = 240;
    obj.bcanvas = document.createElement("canvas");
    obj.bcanvas.width = SPACE_RADIUS * 2;
    obj.bcanvas.height = SPACE_RADIUS * 2;
    obj.bcontext = this.bcanvas.getContext('2d');
    obj.mapcanvas = document.createElement('canvas');
    obj.mapcontext = this.mapcanvas.getContext('2d');

    obj.socket = new WebSocket(SOCKET_URL);
    obj.socket.onopen = function(){
        log("socket open");
    };
    obj.socket.onclose = function(event){};
    obj.socket.onmessage = function(event){
        var data = $.parseJSON(event.data);
        if(obj.GAME_STATE == 0){
            obj.players[0] = Ship(data);
            obj.GAME_STATE = 1;
        } else if(obj.GAME_STATE == 1){
            obj.players[1] = Ship(data);
            obj.GAME_STATE = 2;
        } else if(obj.GAME_STATE == 2){
            for(var i=0; i < data.length; i++){
                for(var key in data[i]) obj.players[key] = data[i][key];
            }
        }
    };
    obj.socket.onerror = function(error){
        log("socket error:", error);
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
        this.bcontext.arc(0, 0, this.SPACE_RADIUS * 0.90, Math.PI * 2, false);
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
        this.mapcontext.arc(0, 0, this.map_size * 0.45, Math.PI * 2, false);
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
        var mx = canvas.width - this.map_size - this.bcanvas.width / 2;
        var my = canvas.height - this.map_size - this.bcanvas.height / 2;
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
        context.drawImage(
            this.bcanvas,
            x, y, this.canvas.width, this.canvas.height,
            - this.canvas.width / 2, - this.canvas.height / 2,
            this.canvas.width, this.canvas.height
        );
    };
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