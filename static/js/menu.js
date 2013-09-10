function MenuItem(title, handler){
    var item = {};

    item.title = title;
    item.handler = handler;
    item.width = 300;
    item.height = 30;
    item.x = 0;
    item.y = 0;

    item.onclick = function(){
        this.handler();
    };
    item.onhover = function(ishover){
        item.ishover = ishover;
    };

    item.draw = function(context){
        context.fillStyle = "white";
        context.strokeStyle = "#CCC";
        context.lineWidth = 2;
        context.beginPath();
        context.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        context.fill();
        context.stroke();
        context.closePath();

        context.font = (this.height - 5) + "px Calibri";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.title, this.x, this.y);
    };

    item.isIn = function(x, y){
        if(
            x >= this.x - this.width / 2 &&
            x <= this.x + this.width / 2 &&
            y >= this.y - this.height / 2 &&
            y <= this.y + this.height / 2
        ) return true;
        return false;
    }
    return item;
}

function MENU(DISPLAY){
    var obj = {};

    obj.display = DISPLAY;
    obj.items = [
        MenuItem("Play game", function(){ obj.display.setHandler(GAME(obj.display)); })
    ];

    obj.draw = function(){
        obj.display.canvas.width = obj.display.canvas.width;
        obj.display.context.translate(obj.display.canvas.width / 2, obj.display.canvas.height / 2);
        for(var i = 0; i < obj.items.length; i++){
            obj.items[i].x = 0;
            obj.items[i].y = obj.display.canvas.height * i / (obj.items.length + 1);
            obj.items[i].draw(obj.display.context);
        }
    };

    obj.onloop = function(){
        obj.draw();
    };

    obj.onclick = function(e){
        var ex = e.x - obj.display.canvas.width / 2;
        var ey = e.y - obj.display.canvas.height / 2;
        for(var i = 0; i < obj.items.length; i++){
            if(obj.items[i].isIn(ex, ey)) obj.items[i].onclick();
        }
    };

    return obj;
}