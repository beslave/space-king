var display = null;


function isFull(){
    return true;
    return window.self !== window.top;
}

function onResize(e){
    var CONTENT_BLOCK = document.getElementById("contentID");
    var menu = document.getElementById("menuID");
    var menu_style = menu.current_style || window.getComputedStyle(menu);
    var content_style = CONTENT_BLOCK.current_style || window.getComputedStyle(CONTENT_BLOCK);
    var busyHeight = 0;
    if(!isFull()) busyHeight += menu.offsetHeight + parseInt(menu_style.marginTop) + parseInt(menu_style.marginBottom);
    busyHeight += parseInt(content_style.marginTop) + parseInt(content_style.marginBottom);
    display.setWidth(CONTENT_BLOCK.scrollWidth);
    display.setHeight(window.innerHeight - busyHeight);
}

function log(msg){
    console.log(msg);
}

$(document).ready(function(e){
    if(isFull()) document.getElementById("menuID").style.display = "none";
    display = DISPLAY(document.getElementById("gameID"), SPACE_RADIUS);
    $('li, a').hover(function(e){
        $(this).addClass('hover');
    }, function(e){
        $(this).removeClass('hover');
    });
    window.onresize = onResize;
    onResize();
    display.setHandler(MENU(display));
    display.loop();
});