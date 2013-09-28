function preparePlayerPreview(player, position){
    player.preview = {}
    player.preview.canvas = document.createElement("canvas");
    player.preview.avatar = document.createElement("image");
    player.preview.avatar.onload = function(e){
        var interval = 7;
        var preview_context = player.preview.canvas.getContext("2d");
        var fio_font = "24px Calibri";
        var stat_font = "20px Arial";
        var stat_y = 33;
        var fio = player.user_info.fio;

        var separator = [" / ", "white"];
        var stat_data = [
            [player.user_info.battles, "#FC0"],
            separator,
            [player.user_info.wins, "#0F0"],
            separator,
            [player.user_info.defeats, "#F00"]
        ];
        var stat = "";
        for(var i = 0; i < stat_data.length; i++) stat += stat_data[i][0];

        // check texts widths"
        preview_context.font = fio_font;
        var mfio = preview_context.measureText(fio);
        preview_context.font = stat_font;
        var mstat = preview_context.measureText(stat);

        player.preview.canvas.height = player.preview.avatar.height;
        player.preview.canvas.width = Math.max(mfio.width, mstat.width) + player.preview.avatar.width + interval;

        preview_context.globalCompositeOperation = "lighter";
        preview_context.globalAlpha = 0.8;

        var avatar_x = (position == 0 ? 0 : player.preview.canvas.width - player.preview.avatar.width);
        preview_context.drawImage(
            player.preview.avatar,
            0, 0, player.preview.avatar.width, player.preview.avatar.height,
            avatar_x, 0, player.preview.avatar.width, player.preview.avatar.height
        );

        preview_context.textAlign = "left";
        preview_context.textBaseline = "top";

        preview_context.font = fio_font;
        preview_context.fillStyle = "yellow";
        var fio_x = (position == 0 ? player.preview.avatar.width + interval : 0);
        preview_context.fillText(fio, fio_x, 0);

        preview_context.font = stat_font;

        var stat_x = (position == 0 ? player.preview.avatar.width + interval : 0);
        var stat_part_x = stat_x;
        for(var i = 0; i < stat_data.length; i++){
            preview_context.fillStyle = stat_data[i][1];
            preview_context.fillText(stat_data[i][0], stat_part_x, stat_y);
            var mt = preview_context.measureText(stat_data[i][0]);
            stat_part_x += mt.width;
        }
    }
    player.preview.avatar.src = player.user_info.avatar;
}

function GAME(DISPLAY){
    var obj = {};
    obj.display = DISPLAY;
    obj.bg_image = DISPLAY.fon;
    obj.bg_canvas = document.createElement("canvas");
    obj.bg_context = obj.bg_canvas.getContext("2d");

    obj.lc = 0;     // loop counter
    obj.SPACE_RADIUS = DISPLAY.SPACE_RADIUS || 1000;

    // 0 - SELF SHIP PARAMS LOADING
    // 1 - OTHER OBJECTS LOADING
    // 2 - POSITION REFRESHING
    obj.GAME_STATE = 0;
    
    obj.players = [null, null];
    obj.map_size = 240;
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
            obj.GAME_STATE++;
        } else if(obj.GAME_STATE == 1){
            obj.players[1] = Ship(data, obj);
            obj.GAME_STATE++;
        } else if(obj.GAME_STATE == 2){
            obj.players[0].user_info = data;
            preparePlayerPreview(obj.players[0], 0);
            obj.GAME_STATE++;
        } else if(obj.GAME_STATE == 3){
            obj.players[1].user_info = data;
            preparePlayerPreview(obj.players[1], 1);
            obj.GAME_STATE++;
            obj.prepareBackground();
        } else if(obj.GAME_STATE == 4){
            for(var i=0; i < data.length; i++){
                for(var key in data[i]) obj.players[i][key] = data[i][key];
            }
        }
    };
    obj.socket.onerror = function(error){
        log("socket error:", error);
    };

    obj.prepareBackground = function(){
        var size = this.SPACE_RADIUS * 2;
        this.bg_canvas.width = size;
        this.bg_canvas.height = size;
        var k = Math.max(size / this.bg_image.width, size / this.bg_image.height);
        var f_width = this.bg_image.width * k;
        var f_height = this.bg_image.height * k;
        var ix = (f_width - size) / (2.0 * k);
        var iy = (f_height - size) / (2.0 * k);
        var iw = this.bg_canvas.width / k;
        var ih = this.bg_canvas.height / k;
        this.bg_context.translate(this.SPACE_RADIUS, this.SPACE_RADIUS);
        this.bg_context.rotate(-this.players[0].rotation);
        this.bg_context.drawImage(
            this.bg_image,
            ix, iy, iw, ih,
            -this.SPACE_RADIUS, -this.SPACE_RADIUS,
            this.bg_canvas.width, this.bg_canvas.height
        );

        // Draw area
        this.bg_context.strokeStyle = "#F00";
        this.bg_context.lineWidth = this.SPACE_RADIUS * 0.01;
        this.bg_context.beginPath();
        this.bg_context.arc(0, 0, this.SPACE_RADIUS - this.bg_context.lineWidth/2, Math.PI * 2, false);
        this.bg_context.closePath();
        this.bg_context.stroke();
        this.bg_context.rotate(this.players[0].rotation);
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
        this.display.bcontext.font = "30px Calibri";
        this.display.bcontext.fillStyle = "yellow";
        this.display.bcontext.textAlign = "left";
        this.display.bcontext.textBaseline = "middle";
        var text = "Waiting for second player ";
        var m = this.display.bcontext.measureText(text);
        text += Array(parseInt(this.lc/5 % 25)).join(".");
        this.display.bcontext.fillText(
            text,
            Math.max(-this.display.buffer.width/2 + 5, -m.width),
            0
        );
        this.display.flip();
    };
    obj.draw = function(){
        var pos = this.getPosition();
        console.log(pos.x, pos.y);
        this.prepareBuffer();
        this.drawBackground(pos.x, pos.y);

        this.display.bcontext.rotate(-this.players[0].rotation);
        this.drawObjects(pos.x, pos.y);            
        // this.drawMap();
        // this.showMap(pos.x, pos.y);
        // this.prepareContext();
        // this.showBuffer(pos.x, pos.y);
        // this.drawUserPreviews();
        this.display.bcontext.rotate(this.players[0].rotation);
        this.display.flip();
    };
    obj.getPosition = function(){
        var x = this.players[0].x  + this.SPACE_RADIUS - this.display.buffer.width / 2;
        var y = this.players[0].y  + this.SPACE_RADIUS - this.display.buffer.height / 2;
        if(x < 0) x = 0;
        if(x > this.SPACE_RADIUS * 2 - this.display.buffer.width)
            x = this.SPACE_RADIUS * 2 - this.display.buffer.width;
        if(y < 0) y = 0;
        if(y > this.SPACE_RADIUS * 2 - this.display.buffer.height)
            y = this.SPACE_RADIUS * 2 - this.display.buffer.height;
        return {
            x: x,
            y: y
        };
    };
    obj.prepareBuffer = function(){
        this.display.buffer.width = this.display.buffer.width;
        this.display.bcontext.translate(
            this.display.buffer.width / 2,
            this.display.buffer.height / 2
        );
    };
    obj.drawBackground = function(x, y){
        var w = this.display.buffer.width, h = this.display.buffer.height;
        this.display.bcontext.drawImage(this.bg_canvas, x, y, w, h, -w / 2, -h / 2,  w, h);
    };
    obj.drawObjects = function(x, y){
        this.display.bcontext.translate(0, 0);
        for(var i = 0; i < 2; i++) this.players[i].draw(this.display.bcontext, x, y);
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
        this.display.buffer.width = this.display.buffer.width;
        this.display.bcontext.translate(
            this.display.buffer.width / 2,
            this.display.buffer.height / 2
        );
    };
    obj.drawUserPreviews = function(){
        var pad = 5;
        this.context.drawImage(
            this.players[0].preview.canvas,
            0, 0,
            this.players[0].preview.canvas.width,
            this.players[0].preview.canvas.height,
            pad - this.canvas.width / 2, pad - this.canvas.height / 2,
            this.players[0].preview.canvas.width,
            this.players[0].preview.canvas.height
        );
        this.context.drawImage(
            this.players[1].preview.canvas,
            0, 0,
            this.players[1].preview.canvas.width,
            this.players[1].preview.canvas.height,
            this.canvas.width / 2 - this.players[1].preview.canvas.width - pad,
            pad - this.canvas.height / 2,
            this.players[1].preview.canvas.width,
            this.players[1].preview.canvas.height
        );
    };
    obj.close = function(){
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.close();
        delete this;
    };
    obj.win = function(){
        obj.display.showMenu();
        obj.display.addInfoMessage("You win!");
    };
    obj.lose = function(){
        obj.display.showMenu();
        obj.display.addErrorMessage("You lose!");
    };
    obj.onloop = function(){
        if(obj.GAME_STATE >= 3){
            obj.draw();
            if(obj.players[0].win) obj.win();
            if(obj.players[0].lose) obj.lose();
        } else obj.wait();
        obj.lc++;
    };

    return obj;
};