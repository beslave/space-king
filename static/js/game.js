function preparePlayerPreview(player, position){
    player.preview = {}
    player.preview.canvas = document.createElement("canvas");
    player.preview.avatar = document.createElement("image");
    player.preview.avatar.onload = function(e){
        var interval = 7;
        var preview_context = player.preview.canvas.getContext("2d");
        var fio_font = BASE_FONT;
        var stat_font = SMALL_FONT;
        var stat_y = 33;
        var fio = player.user_info.fio;

        var separator = [" / ", TXT_COLOR];
        var stat_data = [
            [player.user_info.battles, INFO_COLOR],
            separator,
            [player.user_info.wins, JOY_COLOR],
            separator,
            [player.user_info.defeats, WAR_COLOR]
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
        preview_context.globalAlpha = PREVIEW_ALPHA;

        var avatar_x = (position == 0 ? 0 : player.preview.canvas.width - player.preview.avatar.width);
        preview_context.drawImage(
            player.preview.avatar,
            0, 0, player.preview.avatar.width, player.preview.avatar.height,
            avatar_x, 0, player.preview.avatar.width, player.preview.avatar.height
        );

        preview_context.textAlign = "left";
        preview_context.textBaseline = "top";

        preview_context.font = fio_font;
        preview_context.fillStyle = BASE_COLOR;
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
        preview_context.globalAlpha = 1.0;
    }
    if(player.user_info.avatar){
        player.preview.avatar.src = player.user_info.avatar;
    }
}

function GAME(DISPLAY){
    var obj = {};
    obj.display = DISPLAY;
    obj.bg_image = DISPLAY.fon;
    obj.bg_canvas = document.createElement("canvas");
    obj.bg_context = obj.bg_canvas.getContext("2d");

    obj.lc = 0;     // loop counter
    obj.SPACE_RADIUS = DISPLAY.SPACE_RADIUS || 1000;
    obj.pad = BASE_PADDING;

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
        obj.display.addErrorMessage(CONNECTION_LOST);
    };
    obj.socket.onmessage = function(event){
        var data = $.parseJSON(event.data);
        if(obj.GAME_STATE == 0){
            obj.players[0] = Ship(data, obj);
            obj.GAME_STATE++;
        } else if(obj.GAME_STATE == 1){
            obj.players[0].user_info = data;
            preparePlayerPreview(obj.players[0], 0);
            obj.GAME_STATE++;
        } else if(obj.GAME_STATE == 2){
            obj.players[1] = Ship(data, obj);
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
            if(obj.players[0].win) obj.win();
            if(obj.players[0].lose) obj.lose();
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
        this.bg_context.drawImage(
            this.bg_image,
            ix, iy, iw, ih,
            0, 0, this.bg_canvas.width, this.bg_canvas.height
        );

        // Draw area
        this.bg_context.strokeStyle = WAR_COLOR;
        this.bg_context.lineWidth = this.SPACE_RADIUS * 0.01;
        this.bg_context.translate(this.SPACE_RADIUS, this.SPACE_RADIUS);
        this.bg_context.beginPath();
        this.bg_context.arc(0, 0, this.SPACE_RADIUS - this.bg_context.lineWidth/2, Math.PI * 2, false);
        this.bg_context.closePath();
        this.bg_context.translate(-this.SPACE_RADIUS, -this.SPACE_RADIUS);
        this.bg_context.stroke();
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
        this.display.buffer.width = this.display.buffer.width;
        this.display.bcontext.translate(this.cx, this.cy);
        this.display.bcontext.font = LARGE_FONT;
        this.display.bcontext.fillStyle = BASE_COLOR;
        this.display.bcontext.textAlign = "left";
        this.display.bcontext.textBaseline = "middle";
        var text = WAIT_PLAYER + " ";
        var m = this.display.bcontext.measureText(text);
        text += Array(parseInt(this.lc/5 % 25)).join(".");
        this.display.bcontext.fillText(
            text,
            Math.max(-this.display.buffer.width/2 + 5, -m.width),
            0
        );
        this.display.bcontext.translate(-this.cx, -this.cy);
        this.display.flip();
    };
    obj.draw = function(){
        var pos = this.getPosition();

        this.display.bcontext.translate(this.cx, this.cy);
        this.display.bcontext.rotate(-this.players[0].rotation);
        this.display.bcontext.translate(-this.cx, -this.cy);

        this.drawBackground(pos.x, pos.y);
        this.drawObjects(pos.x, pos.y);

        this.display.bcontext.translate(this.cx, this.cy);
        this.display.bcontext.rotate(this.players[0].rotation);
        this.display.bcontext.translate(-this.cx, -this.cy);

        this.drawMap(this.display.bcontext);
        this.drawUserPreviews(this.display.bcontext);

        this.display.flip();
    };
    obj.getPosition = function(){
        var x = this.players[0].x;
        var y = this.players[0].y;
        if(x < -this.SPACE_RADIUS + this.display.buffer.width / 2)
            x = -this.SPACE_RADIUS + this.display.buffer.width / 2;
        if(x > this.SPACE_RADIUS - this.display.buffer.width / 2)
            x = this.SPACE_RADIUS - this.display.buffer.width / 2;
        if(y < -this.SPACE_RADIUS + this.display.buffer.height / 2)
            y = -this.SPACE_RADIUS + this.display.buffer.height / 2;
        if(y > this.SPACE_RADIUS - this.display.buffer.height / 2)
            y = this.SPACE_RADIUS - this.display.buffer.height / 2;
        return {
            x: x,
            y: y
        };
    };
    obj.drawBackground = function(x, y){
        var w = this.display.buffer.width, h = this.display.buffer.height;
        this.display.bcontext.globalAlpha = BASE_ALPHA;
        this.display.bcontext.drawImage(this.bg_canvas,
            x - w / 2 + this.SPACE_RADIUS, y - h / 2 + this.SPACE_RADIUS, w, h,
            0, 0,  w, h
        );
        this.display.bcontext.globalAlpha = 1;
    };
    obj.drawObjects = function(x, y){
        for(var i = 0; i < this.players.length; i++){
            this.players[i].draw(
                this.display.bcontext,
                this.players[i].x - x + this.display.buffer.width / 2,
                this.players[i].y - y + this.display.buffer.height / 2
            );
        }
    };
    obj.drawMap = function(context){
        var mx = this.display.buffer.width - this.map_size / 2 - this.pad;
        var my = this.display.buffer.height - this.map_size / 2 - this.pad;
        context.translate(mx, my);
        context.rotate(-this.players[0].rotation);

        // Draw area
        context.fillStyle = "rgba(200,224,127,0.4)";
        context.strokeStyle = "rgba(255,0,0,0.4)";
        context.lineWidth = this.map_size * 0.02;
        context.beginPath();
        context.arc(0, 0, (this.map_size - context.lineWidth) / 2, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.stroke();

        // Draw ships
        context.lineWidth = this.map_size * 0.03;
        // Style for first ship
        context.fillStyle = "rgba(255,255,127,0.5)";
        context.strokeStyle = "rgba(196,255,63,0.3)";
        for(var i = 0; i < 2; i++){
            context.beginPath();
            context.arc(
                this.players[i].x * this.map_size / this.SPACE_RADIUS * 0.5,
                this.players[i].y * this.map_size / this.SPACE_RADIUS * 0.5,
                this.map_size * this.players[i].radius / this.SPACE_RADIUS * 0.5,
                Math.PI * 2, false);
            context.closePath();
            context.fill();
            context.stroke();

            // Style for other ships
            context.fillStyle = "rgba(255,127,127,0.5)";
            context.strokeStyle = "rgba(255,127,63,0.3)";
        }
        context.rotate(this.players[0].rotation);
        context.translate(-mx, -my);
    };
    obj.drawUserPreviews = function(context){
        context.drawImage(
            this.players[0].preview.canvas,
            0, 0,
            this.players[0].preview.canvas.width,
            this.players[0].preview.canvas.height,
            this.pad, this.pad,
            this.players[0].preview.canvas.width,
            this.players[0].preview.canvas.height
        );
        context.drawImage(
            this.players[1].preview.canvas,
            0, 0,
            this.players[1].preview.canvas.width,
            this.players[1].preview.canvas.height,
            this.display.buffer.width - this.players[1].preview.canvas.width - this.pad, this.pad,
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
        obj.display.addInfoMessage(YOU_WIN);
    };
    obj.lose = function(){
        obj.display.showMenu();
        obj.display.addErrorMessage(YOU_LOSE);
    };
    obj.onloop = function(){
        obj.cx = obj.display.buffer.width / 2;
        obj.cy = obj.display.buffer.height / 2;
        if(obj.GAME_STATE >= 3){
            if(!obj.already_drawed){
                obj.display.buffer.width = obj.display.buffer.width;
                obj.display.canvas.width = obj.display.canvas.width;
            }
            obj.draw();
        } else obj.wait();
        obj.lc++;
    };

    return obj;
};