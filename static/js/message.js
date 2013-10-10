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
        var msg =  iFormat(d.getHours(), 2) + ":" + iFormat(d.getMinutes(), 2) + ":" + iFormat(d.getSeconds(), 2) + " - " + this.msg;
        context.fillText(msg, x, y);
        context.strokeText(msg, x, y);
    }
    return obj;
}

function iFormat(number, len){
    number = parseInt(number);
    var rez = "";
    for(var i=len; i>0; i--){
        rez += Math.floor(number % Math.pow(10, i) / Math.pow(10, i-1)) % 10;
    }
    return rez
}