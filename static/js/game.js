function preparePlayerPreview(player, position){
    player.preview = {};

    var prepare_preview = function(e){
        display.ocontext.save();
        var interval = 7;
        var fio_font = BASE_FONT;
        var stat_font = SMALL_FONT;
        var stat_y = 33;
        var fio = player.user_info.fio ? player.user_info.fio : 'Guest';

        var separator = [" / ", TXT_COLOR];
        var stat_data = [
            [player.user_info.battles ? player.user_info.battles : '-', INFO_COLOR],
            separator,
            [player.user_info.wins ? player.user_info.wins : '-', JOY_COLOR],
            separator,
            [player.user_info.defeats ? player.user_info.defeats : '-', WAR_COLOR]
        ];
        var stat = "";
        for(var i = 0; i < stat_data.length; i++) stat += stat_data[i][0];

        // check texts widths"
        display.ocontext.font = fio_font;
        var mfio = display.ocontext.measureText(fio);
        display.ocontext.font = stat_font;
        var mstat = display.ocontext.measureText(stat);

        var canvas_height = player.preview.avatar ? player.preview.avatar.height : 100;
        var avatar_width = player.preview.avatar ? player.preview.avatar.width : 0;
        var canvas_width = Math.max(mfio.width, mstat.width) + avatar_width + interval;

        var xpos = position == 0 ? BASE_PADDING : display.buffer.width - canvas_width - BASE_PADDING;
        var ypos = BASE_PADDING;

        display.ocontext.translate(xpos, ypos);

        display.ocontext.globalCompositeOperation = "lighter";
        display.ocontext.globalAlpha = PREVIEW_ALPHA;

        if(player.user_info.avatar){
            var avatar_x = (position == 0 ? 0 : canvas_width - avatar_width);
            display.ocontext.drawImage(
                player.preview.avatar,
                0, 0, player.preview.avatar.width, player.preview.avatar.height,
                avatar_x, 0, player.preview.avatar.width, player.preview.avatar.height
            );
        }

        display.ocontext.textAlign = "left";
        display.ocontext.textBaseline = "top";

        display.ocontext.font = fio_font;
        display.ocontext.fillStyle = BASE_COLOR;
        var fio_x = (position == 0 ? avatar_width + interval : 0);
        display.ocontext.fillText(fio, fio_x, 0);

        display.ocontext.font = stat_font;

        var stat_x = (position == 0 ? avatar_width + interval : 0);
        var stat_part_x = stat_x;
        for(var i = 0; i < stat_data.length; i++){
            display.ocontext.fillStyle = stat_data[i][1];
            display.ocontext.fillText(stat_data[i][0], stat_part_x, stat_y);
            var mt = display.ocontext.measureText(stat_data[i][0]);
            stat_part_x += mt.width;
        }
        player.preview.is_ready = true;
        display.ocontext.restore();
    }
    if(player.user_info.avatar){
        player.preview.avatar = document.createElement("image");
        player.preview.avatar.src = player.user_info.avatar;
        player.preview.avatar.onload = prepare_preview
    } else {
        prepare_preview();
    }
}

function GAME(DISPLAY){
    var obj = {};
    obj.display = DISPLAY;

    obj.lc = 0;     // loop counter
    obj.SPACE_RADIUS = DISPLAY.SPACE_RADIUS || 1000;
    obj.pad = BASE_PADDING;
    obj.container = document.getElementById('display');

    // 0 - SELF SHIP PARAMS LOADING
    // 1 - OTHER OBJECTS LOADING
    // 2 - POSITION REFRESHING
    obj.GAME_STATE = 0;
    
    obj.players = [null, null];
    obj.map_size = 240;

    obj.connect = function(){
        obj.socket = new SockJS(SOCKET_URL, sockjs_options);
        obj.socket.onopen = function(){
            log("socket open");
        };
        obj.socket.onclose = function(event){
            if(obj.GAME_STATE == 0) obj.connect();
            else {
                obj.display.showMenu();
                obj.display.addErrorMessage(CONNECTION_LOST);
            }
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
                obj.display.buffer.width = obj.display.buffer.width;
                obj.display.canvas.width = obj.display.canvas.width;
                obj.GAME_STATE++;
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
    };
    obj.connect();

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
    obj.clear = function(){
        this.display.bcontext.clearRect(0, 0, this.display.buffer.width, this.display.buffer.height);
        // clear objects
        // for(var i = 0; i < this.players.length; i++) this.players[i].clear(this.display.bcontext);

        // clear map
        // if(this.mx && this.my){
        //     this.display.bcontext.clearRect(
        //         this.mx - this.map_size,
        //         this.my - this.map_size,
        //         this.map_size * 2,
        //         this.map_size * 2
        //     );
        // }
    };
    obj.draw = function(){
        this.clear();
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
        k = Math.round(Math.cos(this.players[0].rotation));
        x *= k;
        y *= k;
        var px = -this.SPACE_RADIUS + this.cx - x + 'px';
        var py = -this.SPACE_RADIUS + this.cy - y + 'px';
        this.display.container.style.backgroundPosition = px + ' ' + py;
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
        this.mx = this.display.buffer.width - this.map_size / 2 - this.pad;
        this.my = this.display.buffer.height - this.map_size / 2 - this.pad;
        context.translate(this.mx, this.my);
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
        context.translate(-this.mx, -this.my);
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
        obj.is_unchanged = false;
        obj.cx = obj.display.buffer.width / 2;
        obj.cy = obj.display.buffer.height / 2;
        if(obj.GAME_STATE >= 3){
            obj.draw();
        } else obj.wait();
        obj.lc++;
    };

    return obj;
};