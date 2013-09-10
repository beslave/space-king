var fon = new Image();
fon.src = "/static/css/images/main_background.jpeg";


function onResize(e){
    var CONTENT_BLOCK = document.getElementById("contentID");
    var menu = document.getElementById("menuID");
    var menu_style = menu.current_style || window.getComputedStyle(menu);
    var content_style = CONTENT_BLOCK.current_style || window.getComputedStyle(CONTENT_BLOCK);
    var busyHeight = 0;
    busyHeight += menu.offsetHeight + parseInt(menu_style.marginTop) + parseInt(menu_style.marginBottom);
    busyHeight += parseInt(content_style.marginTop) + parseInt(content_style.marginBottom);
    DISPLAY.setWidth(Math.max(window.innerHeight - busyHeight, 240));
    DISPLAY.setHeight(Math.max(CONTENT_BLOCK.offsetWidth, 240));
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

$(document).ready(function(e){
    $('li, a').hover(function(e){
        $(this).addClass('hover');
    }, function(e){
        $(this).removeClass('hover');
    });
    if($('#gameID').size() > 0){
        window.onresize = onResize;
        onResize();
    }
});