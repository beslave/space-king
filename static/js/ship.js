function Ship(kwargs){
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
    obj.fire_bottoms = [1.7, 1.7, 1.85];
    obj.draw = function(parent_context){
        this.prepare_context();
        this.rotate_ship();
        this.draw_casing();
        this.draw_window();
        this.draw_turbines();
        if(this.is_forward) this.draw_forward_fires();
        if(this.is_backward) this.draw_reverse_fires();
        this.draw_reverse_turbines();
        this.flush(parent_context);
        
    };
    obj.prepare_context = function(){
        this.canvas.width = this.canvas.width;
        this.context.translate(this.radius * 2, this.radius * 2);
    };
    obj.rotate_ship = function(){
        this.context.rotate(Math.PI / 2 - this.angle);
    };
    obj.draw_casing = function(){
        this.context.beginPath();
        this.context.arc(0, 0, this.radius, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.lineWidth = obj.radius * 0.03;
        this.context.strokeStyle = this.light_color;
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    };
    obj.draw_window = function(){
        this.context.beginPath();
        this.context.rect(- this.radius * 0.55, - this.radius * 0.8, this.radius * 1.1, this.radius * 0.3);
        this.context.fillStyle = "#000";
        this.context.closePath();
        this.context.fill();
    };
    obj.draw_turbines = function(){
        this.context.fillStyle = this.turbine_color;
        this.context.strokeStyle = this.light_color;
        var hoffsets = [-this.turbine_hoffset, this.turbine_hoffset];
        for(var h in hoffsets){
            this.context.beginPath();
            this.context.moveTo(hoffsets[h], this.turbine_voffset);
            this.context.lineTo(hoffsets[h] - this.turbine_width/2,
                                this.turbine_voffset + this.turbine_height);
            this.context.lineTo(hoffsets[h] + this.turbine_width/2,
                                this.turbine_voffset + this.turbine_height);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    };
    obj.draw_forward_fires = function(){
        this.context.fillStyle = "#FF0";
        this.context.strokeStyle = "#F00";
        this.context.lineWidth = this.turbine_width * 0.05;
        var rows = [
            [this.is_left && !this.is_right ? 1 : 0, - this.turbine_hoffset],
            [!this.is_left && this.is_right ? 1 : 0, this.turbine_hoffset]
        ];
        for(var r in rows){
            this.context.beginPath();
            this.context.moveTo(rows[r][1] - 0.4 * this.turbine_width,
                                this.turbine_voffset + 1.1 * this.turbine_height);
            this.context.lineTo(rows[r][1] + 0.4 * this.turbine_width,
                                this.turbine_voffset + 1.1 * this.turbine_height);
            this.context.lineTo(rows[r][1],
                                (this.fire_bottoms[this.draw_counter % 3] - rows[r][0] * 0.3) * this.radius);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    };
    obj.draw_reverse_fires = function(){
        this.context.strokeStyle = "#0CF";
        this.context.lineWidth = this.turbine_width * 0.04;
        var rows = [
            [this.is_left && !this.is_right ? 0.5 : 1, this.turbine_hoffset],
            [!this.is_left && this.is_right ? 0.5 : 1, - this.turbine_hoffset]
        ];
        var i = this.draw_counter;
        var top_y = this.turbine_voffset + this.turbine_height * 0.7;
        for(r in rows){
            for(var x = - this.turbine_width * 0.8; x <= 0.8 * this.turbine_width; x += 0.2 * this.turbine_width, i++){
                var length = this.turbine_height * this.fire_bottoms[i % 3] * 0.5 * rows[r][0];
                this.context.beginPath();
                this.context.moveTo(rows[r][1], top_y);
                this.context.lineTo(rows[r][1] + x, Math.sqrt((length + x) * (length - x)) + top_y); // x^2-y^2 = (x+y)*(y-x)
                this.context.closePath();
                this.context.stroke();
            }
        }
    };
    obj.draw_reverse_turbines = function(){
        this.context.lineWidth = this.turbine_width * 0.05;
        this.context.fillStyle = "#123";
        this.context.strokeStyle = "#000";
        var hoffsets = [this.turbine_hoffset, -this.turbine_hoffset];
        for(var i in hoffsets){
            this.context.beginPath();
            this.context.arc(hoffsets[i], this.turbine_voffset + this.turbine_height * 0.7, this.turbine_width * 0.2, 2 * Math.PI, false);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    };
    obj.flush = function(context){
        this.draw_counter++;
        context.drawImage(this.canvas, this.x - this.canvas.width / 2, this.y - this.canvas.height / 2);
    };
    obj.forward = function(is_on){
        var prev = this.is_forward;
        if(is_on && !prev) socket.send('forward on');
        else if(!is_on && prev) socket.send('forward off');
        this.is_forward = is_on;
    };
    obj.backward = function(is_on){
        var prev = this.is_backward;
        if(is_on && !prev) socket.send('backward on');
        else if(!is_on && prev) socket.send('backward off');
        this.is_backward = is_on;
    };
    obj.right = function(is_on){
        var prev = this.is_right;
        if(is_on && !prev) socket.send('right on');
        else if(!is_on && prev) socket.send('right off');
        this.is_right = is_on;
    };
    obj.left = function(is_on){
        var prev = this.is_left;
        if(is_on && !prev) socket.send('left on');
        else if(!is_on && prev) socket.send('left off');
        this.is_left = is_on;
    };
    check_performance("Ship drawing", obj, [
        "prepare_context",
        "rotate_ship",
        "draw_casing",
        "draw_window",
        "draw_turbines",
        "draw_forward_fires",
        "draw_reverse_fires",
        "draw_reverse_turbines",
        "flush",
        "forward",
        "backward",
        "right",
        "left"
    ]);
    return obj;
};