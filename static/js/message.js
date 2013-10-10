function Message(msg, type){
    var obj = {};
    if(!type) type = "info"; // warning, error
    obj.msg = msg;
    obj.type = type;
    obj.font = "24px Arial";
    obj.time = new Date().getTime();

    obj.draw = function(context, x, y){
        context.textAlign = "left";
        context.textBaseline = "top";
        if(this.type == "info"){
            context.fillStyle = "#0F0";
            context.strokeStyle = "#FF0";
        } else if(this.type == "warning"){
            context.fillStyle = "#FC0";
            context.strokeStyle = "#FF0";
        } else {
            context.fillStyle = "#F00";
            context.strokeStyle = "#F70";
        }
        context.lineWidth = 1;
        context.font = this.font;
        var d = new Date(this.time);
        var msg = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " - " + this.msg;
        context.fillText(msg, x, y);
        context.strokeText(msg, x, y);
    }
    return obj;
}