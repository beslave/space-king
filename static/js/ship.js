function Ship(kwargs, game){
    var obj = kwargs;
    obj.game = game;

    obj.past_x = obj.x;
    obj.past_y = obj.y;
    obj.past_angle = obj.angle;

    obj.current_x = obj.x;
    obj.current_y = obj.y;
    obj.current_angle = obj.angle;

    obj.dx = 0.0;
    obj.dy = 0.0;
    obj.da = 0.0;

    obj.snapshot_time = new Date().getTime();
    obj.draw_time = obj.snapshot_time;

    obj.is_forward = false;
    obj.is_backward = false;
    obj.is_left = false;
    obj.is_right = false;

    obj.turbine_hoffset = 0.5 * obj.radius;
    obj.turbine_voffset = 0.1 * obj.radius;
    obj.turbine_width = 0.4 * obj.radius;
    obj.turbine_height = 0.95 * obj.radius;

    obj.draw_counter = 0;
    obj.fire_bottoms = [1.7, 1.75, 1.85];

    obj.calculate_current_position = function(){
        if(ENABLE_APPROXIMATION){
            var new_draw_time = new Date().getTime();
            var dt = new_draw_time - this.draw_time;
            this.current_x += this.dx * dt;
            this.current_y += this.dy * dt;
            this.current_angle += this.da * dt;
            this.draw_time = new_draw_time;
        } else {
            this.current_x = this.x;
            this.current_y = this.y;
            this.current_angle = this.angle;
        }
    };

    obj.draw = function(context, ox, oy){
        this.rx = ox + this.current_x;
        this.ry = oy + this.current_y;
        context.translate(this.rx, this.ry);
        context.rotate(Math.PI / 2 - this.current_angle);
        this.draw_casing(context);
        this.draw_window(context);
        this.draw_turbines(context);
        if(this.is_forward) this.draw_forward_fires(context);
        if(this.is_backward) this.draw_reverse_fires(context);
        this.draw_reverse_turbines(context);
        context.rotate(this.current_angle - Math.PI / 2);
        context.translate(-this.rx, -this.ry);
        this.draw_counter++;
    };

    obj.clear = function(context){
        if(this.rx && this.ry){
            var D = 2 * this.radius;
            context.clearRect(this.rx - D, this.ry - D, D * 2, D * 2);
        }
    };

    obj.draw_casing = function(context){
        context.beginPath();
        context.arc(0, 0, this.radius, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.lineWidth = obj.radius * 0.03;
        context.strokeStyle = this.light_color;
        context.closePath();
        context.fill();
        context.stroke();
    };

    obj.draw_window = function(context){
        context.beginPath();
        context.rect(- this.radius * 0.55, - this.radius * 0.8, this.radius * 1.1, this.radius * 0.3);
        context.fillStyle = "#000";
        context.closePath();
        context.fill();
    };
    obj.draw_turbines = function(context){
        context.fillStyle = this.turbine_color;
        context.strokeStyle = this.light_color;
        var hoffsets = [-this.turbine_hoffset, this.turbine_hoffset];
        for(var h in hoffsets){
            context.beginPath();
            context.moveTo(hoffsets[h], this.turbine_voffset);
            context.lineTo(
                hoffsets[h] - this.turbine_width/2,
                this.turbine_voffset + this.turbine_height
            );
            context.lineTo(
                hoffsets[h] + this.turbine_width/2,
                this.turbine_voffset + this.turbine_height
            );
            context.closePath();
            context.fill();
            context.stroke();
        }
    };

    obj.draw_forward_fires = function(context){
        context.fillStyle = "#FF0";
        context.strokeStyle = "#F00";
        context.lineWidth = this.turbine_width * 0.05;
        var rows = [
            [this.is_left && !this.is_right ? 1 : 0, - this.turbine_hoffset],
            [!this.is_left && this.is_right ? 1 : 0, this.turbine_hoffset]
        ];
        for(var r in rows){
            context.beginPath();
            context.moveTo(
                rows[r][1] - 0.4 * this.turbine_width,
                this.turbine_voffset + 1.1 * this.turbine_height
            );
            context.lineTo(
                rows[r][1] + 0.4 * this.turbine_width,
                this.turbine_voffset + 1.1 * this.turbine_height
            );
            context.lineTo(rows[r][1], (
                this.fire_bottoms[this.draw_counter % 3] - rows[r][0] * 0.3
            ) * this.radius);
            context.closePath();
            context.fill();
            context.stroke();
        }
    };

    obj.draw_reverse_fires = function(context){
        context.strokeStyle = "#0CF";
        context.lineWidth = this.turbine_width * 0.04;
        var rows = [
            [this.is_left && !this.is_right ? 0.5 : 1, this.turbine_hoffset],
            [!this.is_left && this.is_right ? 0.5 : 1, - this.turbine_hoffset]
        ];
        var i = this.draw_counter;
        var top_y = this.turbine_voffset + this.turbine_height * 0.7;
        for(r in rows){
            for(var x = - this.turbine_width * 0.8; x <= 0.8 * this.turbine_width; x += 0.2 * this.turbine_width, i++){
                var length = this.turbine_height * this.fire_bottoms[i % 3] * 0.5 * rows[r][0];
                context.beginPath();
                context.moveTo(rows[r][1], top_y);
                context.lineTo(rows[r][1] + x, Math.sqrt((length + x) * (length - x)) + top_y); // x^2-y^2 = (x+y)*(y-x)
                context.closePath();
                context.stroke();
            }
        }
    };

    obj.draw_reverse_turbines = function(context){
        context.lineWidth = this.turbine_width * 0.05;
        context.fillStyle = "#123";
        context.strokeStyle = "#000";
        var hoffsets = [this.turbine_hoffset, -this.turbine_hoffset];
        for(var i in hoffsets){
            context.beginPath();
            context.arc(hoffsets[i], this.turbine_voffset + this.turbine_height * 0.7, this.turbine_width * 0.2, 2 * Math.PI, false);
            context.closePath();
            context.fill();
            context.stroke();
        }
    };

    obj.forward = function(is_on){
        var prev = this.is_forward;
        if(is_on && !prev) this.game.notify('forward on');
        else if(!is_on && prev) this.game.notify('forward off');
        this.is_forward = is_on;
    };

    obj.backward = function(is_on){
        var prev = this.is_backward;
        if(is_on && !prev) this.game.notify('backward on');
        else if(!is_on && prev) this.game.notify('backward off');
        this.is_backward = is_on;
    };

    obj.right = function(is_on){
        var prev = this.is_right;
        if(is_on && !prev) this.game.notify('right on');
        else if(!is_on && prev) this.game.notify('right off');
        this.is_right = is_on;
    };

    obj.left = function(is_on){
        var prev = this.is_left;
        if(is_on && !prev) this.game.notify('left on');
        else if(!is_on && prev) this.game.notify('left off');
        this.is_left = is_on;
    };

    obj.update = function(kwargs){
        var last_x = this.x;
        var last_y = this.y;
        var last_angle = this.angle;

        for(var key in kwargs) this[key] = kwargs[key];

        var new_snapshot_time = new Date().getTime();
        var dt = new_snapshot_time - this.snapshot_time;
        var diff_angle = 2 * this.angle - this.current_angle - this.past_angle;
        diff_angle %= 2 * Math.PI;
        if(diff_angle > Math.PI) diff_angle -= 2 * Math.PI;
        this.da = diff_angle / dt;
        this.dx = (2 * this.x - this.current_x - this.past_x) / dt;
        this.dy = (2 * this.y - this.current_y - this.past_y) / dt;

        // @TODO: Make angle approximation
        this.da = 0;
        this.current_angle = this.angle;

        this.past_x = last_x;
        this.past_y = last_y;
        this.past_angle = last_angle;
        this.snapshot_time = new_snapshot_time;
    }
    return obj;
};