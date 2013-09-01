var socket;
// 0 - SELF SHIP PARAMS LOADING
// 1 - OTHER OBJECTS LOADING
// 2 - POSITION REFRESHING
var GAME_STATE = 0;
var OBJECTS = [];

var canvas = null;
var context = null;
var bcanvas = null;     // canvas buffer
var bcontext = null;    // context of buffered canvas
var map_size = 240;
var mapcanvas = null;
var mapcontext = null;
var MAP_RADIUS = 1000;

var fon = new Image();
fon.src = "/static/css/images/main_background.jpeg";

$(document).ready(function(e){
    $('li, a').hover(function(e){
        $(this).addClass('hover');
    }, function(e){
        $(this).removeClass('hover');
    });
    if($('#gameID').size() > 0){
        window.onresize = onResize;
        initSocket();
        canvas = document.getElementById('gameID');
        context = canvas.getContext('2d');
        bcanvas = document.createElement('canvas');
        bcanvas.width = MAP_RADIUS * 2;
        bcanvas.height = MAP_RADIUS * 2;
        bcontext = bcanvas.getContext('2d');
        mapcanvas = document.createElement('canvas');
        mapcontext = mapcanvas.getContext('2d');
        onResize();
        draw();
    }
});

function onResize(e){
    var menu = document.getElementById('menuID');
    var adv = document.getElementById('advID');
    var content = document.getElementById('contentID');
    var footer = document.getElementById('footerID');
    var menu_style = menu.current_style || window.getComputedStyle(menu);
    var adv_style = adv.current_style || window.getComputedStyle(adv);
    var content_style = content.current_style || window.getComputedStyle(content);
    var footer_style = footer.current_style || window.getComputedStyle(footer);
    var busyHeight = menu.offsetHeight + parseInt(menu_style.marginTop) + parseInt(menu_style.marginBottom)
        + adv.offsetHeight + parseInt(adv_style.marginTop) + parseInt(adv_style.marginBottom)
        + parseInt(content_style.marginTop) + parseInt(content_style.marginBottom)
        + footer.offsetHeight + parseInt(footer_style.marginTop) + parseInt(footer_style.marginBottom);
    if(canvas){
        var game_height = Math.max(window.innerHeight - busyHeight, 240);
        var game_width = Math.max(content.offsetWidth, 240);
        canvas.height = game_height;
        canvas.style.height = game_height;
        canvas.width = game_width;
        canvas.style.width = game_width;
    }
}

function initSocket(){
    socket = new WebSocket(SOCKET_URL);
    socket.onopen = function(){
        log("socket open");
    };
    socket.onclose = function(event){
        if(event.wasClean){
        } else {
            // try reconect
            log("socket close");
            setTimeout(initSocket, 1000);
        }
    };
    socket.onmessage = function(event){
        data = $.parseJSON(event.data)
        if(GAME_STATE == 0){
            OBJECTS.push(Ship(data));
            GAME_STATE = 1;
            setControl(true);
        } else if(GAME_STATE == 1){
            for(var i=0; i < data.length; i++) OBJECTS.push(Ship(data[i]));
        }
    };
    socket.onerror = function(error){
        log("socket error:", error);
    };
}

function log(msg){
    console.log(msg);
}

function setControl(on){
    if(on){
        document.onkeydown = onKeyDown;
        document.onkeyup = onKeyUp;
    } else {
        document.onkeydown = null;
        document.onkeyup = null;
    }
}

function onKeyDown(e){
    if(e.keyCode == 38 || e.keyCode == 87) OBJECTS[0].forward(true);
    else if(e.keyCode == 40 || e.keyCode == 83) OBJECTS[0].backward(true);
    else if(e.keyCode == 37 || e.keyCode == 65) OBJECTS[0].left(true);
    else if(e.keyCode == 39 || e.keyCode == 68) OBJECTS[0].right(true);
}

function onKeyUp(e){
    if(e.keyCode == 38 || e.keyCode == 87) OBJECTS[0].forward(false);
    else if(e.keyCode == 40 || e.keyCode == 83) OBJECTS[0].backward(false);
    else if(e.keyCode == 37 || e.keyCode == 65) OBJECTS[0].left(false);
    else if(e.keyCode == 39 || e.keyCode == 68) OBJECTS[0].right(false);
}

var Ship = function(kwargs){
    var obj = kwargs;
    obj.is_forward = false;
    obj.is_backward = false;
    obj.is_left = false;
    obj.is_right = false;
    obj.canvas = document.createElement('canvas');
    obj.canvas.width = obj.radius * 4;
    obj.canvas.height = obj.radius * 4;
    obj.context = obj.canvas.getContext("2d");
    obj.turbine_hoffset = 0.5 * obj.radius;
    obj.turbine_voffset = 0.1 * obj.radius;
    obj.turbine_width = 0.4 * obj.radius;
    obj.turbine_height = 0.95 * obj.radius;
    obj.draw_counter = 0;
    obj.draw = function(parent_context){
        var fire_bottoms = [1.7, 1.7, 1.85];
        // Clear context
        this.canvas.width = this.canvas.width;
        this.context.translate(this.radius * 2, this.radius * 2);
        // Rotate ship by angle
        this.context.rotate(- this.angle * Math.PI / 180.0);
        // Draw casing
        this.context.beginPath();
        this.context.arc(0, 0, this.radius, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.lineWidth = obj.radius * 0.03;
        this.context.strokeStyle = this.light_color;
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        // Draw window
        this.context.beginPath();
        this.context.rect(- this.radius * 0.55, - this.radius * 0.8, this.radius * 1.1, this.radius * 0.3);
        this.context.fillStyle = "#000";
        this.context.closePath();
        this.context.fill();
        /* Draw turbines */
        this.context.fillStyle = this.turbine_color;
        var turbine_angle = 0;
        // left turbine
        this.context.beginPath();
        this.context.moveTo(-this.turbine_hoffset, this.turbine_voffset);
        this.context.lineTo(-this.turbine_hoffset - this.turbine_width/2,
                            this.turbine_voffset + this.turbine_height);
        this.context.lineTo(-this.turbine_hoffset + this.turbine_width/2,
                            this.turbine_voffset + this.turbine_height);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        // right turbine
        this.context.beginPath();
        this.context.moveTo(this.turbine_hoffset, this.turbine_voffset);
        this.context.lineTo(this.turbine_hoffset - this.turbine_width/2,
                            this.turbine_voffset + this.turbine_height);
        this.context.lineTo(this.turbine_hoffset + this.turbine_width/2,
                            this.turbine_voffset + this.turbine_height);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        /* Draw forward fire */
        if(this.is_forward){
            this.context.fillStyle = "#FF0";
            this.context.strokeStyle = "#F00";
            this.context.lineWidth = this.turbine_width * 0.05;
            // Draw left fire
            var left_sub = 0;
            if(this.is_left && !this.is_right) left_sub = 1;
            this.context.beginPath();
            this.context.moveTo(-this.turbine_hoffset - 0.4 * this.turbine_width,
                                this.turbine_voffset + 1.1 * this.turbine_height)
            this.context.lineTo(-this.turbine_hoffset + 0.4 * this.turbine_width,
                                this.turbine_voffset + 1.1 * this.turbine_height);
            this.context.lineTo(-this.turbine_hoffset,
                                (fire_bottoms[this.draw_counter % 3] - left_sub * 0.3) * this.radius);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
            // Draw right fire
            var right_sub = 0;
            if(!this.is_left && this.is_right) right_sub = 1;
            this.context.beginPath();
            this.context.moveTo(this.turbine_hoffset - 0.4 * this.turbine_width,
                                this.turbine_voffset + 1.1 * this.turbine_height)
            this.context.lineTo(this.turbine_hoffset + 0.4 * this.turbine_width,
                                this.turbine_voffset + 1.1 * this.turbine_height);
            this.context.lineTo(this.turbine_hoffset,
                                (fire_bottoms[(this.draw_counter + 2) % 3] - right_sub * 0.3) * this.radius);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
        /* Draw backward fire */
        if(this.is_backward){
            this.context.strokeStyle = "#0CF";
            this.context.lineWidth = this.turbine_width * 0.04;
            // Draw left fire
            var right_sub = 1;
            var left_sub = 1;
            if(this.is_left && !this.is_right) right_sub = 0.5;
            if(!this.is_left && this.is_right) left_sub = 0.5;
            for(var x = - this.turbine_width * 0.8, i = this.draw_counter % 3; x <= 0.8 * this.turbine_width; x += 0.2 * this.turbine_width, i++){
                y = Math.sqrt(Math.pow(this.turbine_height * fire_bottoms[i % 3] * 0.5 * left_sub, 2) - Math.pow(x, 2));
                // Draw left fire
                this.context.beginPath();
                this.context.moveTo(- this.turbine_hoffset, this.turbine_voffset + this.turbine_height * 0.7);
                this.context.lineTo(- this.turbine_hoffset + x, y + this.turbine_voffset + this.turbine_height * 0.7);
                this.context.closePath();
                this.context.stroke();
                // Draw right fire
                y = Math.sqrt(Math.pow(this.turbine_height * fire_bottoms[i % 3] * 0.5 * right_sub, 2) - Math.pow(x, 2));
                this.context.beginPath();
                this.context.moveTo(this.turbine_hoffset, this.turbine_voffset + this.turbine_height * 0.7);
                this.context.lineTo(this.turbine_hoffset + x, y + this.turbine_voffset + this.turbine_height * 0.7);
                this.context.closePath();
                this.context.stroke();
            }
        }
        /* Draw reverse turbins */
        this.context.lineWidth = this.turbine_width * 0.05;
        this.context.fillStyle = "#123";
        this.context.strokeStyle = "#000";
        // left reverse turbine
        this.context.beginPath();
        this.context.arc(-this.turbine_hoffset, this.turbine_voffset + this.turbine_height * 0.7, this.turbine_width * 0.2, 2 * Math.PI, false);
        this.context.closePath();
        this.context.fill();
        this.context.stroke()
        // right reverse turbine
        this.context.beginPath();
        this.context.arc(this.turbine_hoffset, this.turbine_voffset + this.turbine_height * 0.7, this.turbine_width * 0.2, 2 * Math.PI, false);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        this.draw_counter++;

        // Draw on buffer context
        parent_context.drawImage(this.canvas, this.x - this.canvas.width / 2, this.y - this.canvas.height / 2);

        // Test
        if(this.is_backward){
            this.speed_x += this.acceleration_forward * Math.cos((90 - this.angle) * Math.PI / 180);
            this.speed_y += this.acceleration_forward * Math.sin((90 - this.angle) * Math.PI / 180);
        }
        if(this.is_forward){
            this.speed_x -= this.acceleration_forward * Math.cos((90 - this.angle) * Math.PI / 180);
            this.speed_y -= this.acceleration_forward * Math.sin((90 - this.angle) * Math.PI / 180);
        }

        if(this.is_forward || this.is_backward){
            if(this.is_left) this.angle += this.angle_speed;
            if(this.is_right) this.angle -= this.angle_speed;
        }
        this.x += this.speed_x;
        this.y += this.speed_y;
        if(this.x > MAP_RADIUS - this.radius) { this.x = MAP_RADIUS - this.radius; this.speed_x = - this.speed_x; }
        if(this.x < - MAP_RADIUS + this.radius){ this.x = - MAP_RADIUS + this.radius; this.speed_x = - this.speed_x; }
        if(this.y > MAP_RADIUS - this.radius){ this.y = MAP_RADIUS - this.radius; this.speed_y = - this.speed_y; }
        if(this.y < - MAP_RADIUS + this.radius){ this.y = - MAP_RADIUS + this.radius; this.speed_y = - this.speed_y; }
        if(this.speed_x > this.max_speed) this.speed_x = this.max_speed;
        if(this.speed_x < - this.max_speed) this.speed_x = - this.max_speed;
        if(this.speed_y > this.max_speed) this.speed_y = this.max_speed;
        if(this.speed_y < - this.max_speed) this.speed_y = - this.max_speed;
    };
    obj.forward = function(is_on){
        if(is_on && !this.is_forward) log('forward on');
        else if(!is_on && this.is_forward) log('forward off');
        this.is_forward = is_on;
    }
    obj.backward = function(is_on){
        if(is_on && !this.is_backward) log('backward on');
        else if(!is_on && this.is_backward) log('backward off');
        this.is_backward = is_on;       
    }
    obj.right = function(is_on){
        if(is_on && !this.is_right) log('right on');
        else if(!is_on && this.is_right) log('right off');
        this.is_right = is_on;
    }
    obj.left = function(is_on){
        if(is_on && !this.is_left) log('left on');
        else if(!is_on && this.is_left) log('left off');
        this.is_left = is_on;
    }
    return obj;
}

function draw(){
    if(OBJECTS.length > 0){
        bcanvas.width = bcanvas.width;
        var k = Math.max(bcanvas.width / fon.width, bcanvas.height / fon.height);
        var f_width = fon.width * k;
        var f_height = fon.height * k;
        var rangle = OBJECTS[0].angle * Math.PI / 180;
        bcontext.translate(MAP_RADIUS, MAP_RADIUS);
        // bcontext.translate(MAP_RADIUS * (Math.cos(rangle) - Math.sin(rangle)), MAP_RADIUS * (Math.sin(rangle) + Math.cos(rangle)));
        // bcontext.translate(MAP_RADIUS, MAP_RADIUS);
        bcontext.drawImage(fon, 0, 0, fon.width, fon.height,
            - f_width / 2, - f_height / 2, f_width, f_height);
        bcontext.strokeStyle = "#F00";
        bcontext.lineWidth = MAP_RADIUS * 0.01;
        bcontext.beginPath();
        bcontext.arc(0, 0, MAP_RADIUS * 0.90, Math.PI * 2, false);
        bcontext.closePath();
        bcontext.stroke();
        // Draw objects to buffer canvas
        for(var i = 1; i < OBJECTS.length; i++){
            OBJECTS[i].draw(bcontext);
        }
        // OBJECTS[0].draw();
        // Draw buffer image to main canvas
        var dx = OBJECTS[0].x  + MAP_RADIUS - canvas.width / 2;
        var dy = OBJECTS[0].y  + MAP_RADIUS - canvas.height / 2;
        var ox = 0;
        var oy = 0;
        if(dx < 0) { ox = -dx; dx = 0; }
        if(dx > MAP_RADIUS * 2 - canvas.width) { ox = MAP_RADIUS * 2 - canvas.width - dx; dx = MAP_RADIUS * 2 - canvas.width; }
        if(dy < 0) { oy = -dy; dy = 0; }
        if(dy > MAP_RADIUS * 2 - canvas.height){ oy = MAP_RADIUS * 2 - canvas.height - dy; dy = MAP_RADIUS * 2 - canvas.height; }
        // bcontext.rotate(OBJECTS[0].angle * Math.PI / 180);
        // Clear context
        OBJECTS[0].draw(bcontext);
        // Draw map
        mapcanvas.width = map_size;
        mapcanvas.height = map_size;
        mapcontext.translate(map_size/2, map_size/2);
        mapcontext.fillStyle = "rgba(200,224,127,0.4)";
        mapcontext.strokeStyle = "rgba(255,0,0,0.4)";
        mapcontext.lineWidth = map_size * 0.02;
        mapcontext.beginPath()
        mapcontext.arc(0, 0, map_size * 0.45, Math.PI * 2, false);
        mapcontext.closePath();
        mapcontext.fill();
        mapcontext.stroke();
        for(var i = OBJECTS.length - 1; i >= 0; i--){
            mapcontext.lineWidth = map_size * 0.03;
            if(i == 0){ mapcontext.fillStyle = "rgba(255,255,127,0.5)"; mapcontext.strokeStyle = "rgba(196,255,63,0.3)"; }
            else { mapcontext.fillStyle = "rgba(255,127,127,0.5)"; mapcontext.strokeStyle = "rgba(255,127,63,0.3)"; }
            mapcontext.beginPath();
            mapcontext.arc(OBJECTS[i].x * map_size / bcanvas.width, OBJECTS[i].y * map_size / bcanvas.width, map_size * 0.03, Math.PI * 2, false);
            mapcontext.closePath();
            mapcontext.fill();
            mapcontext.stroke();
        }
        canvas.width = canvas.width;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.drawImage(
            bcanvas,
            dx, dy, canvas.width, canvas.height,
            - canvas.width / 2, - canvas.height / 2, canvas.width, canvas.height
        );
        context.drawImage(mapcanvas, 0, 0, map_size, map_size, canvas.width / 2 - map_size, canvas.height / 2 - map_size, map_size, map_size);
    }
    setTimeout(draw, 0);
}