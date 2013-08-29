$(document).ready(function(e){
    $('li, a').hover(function(e){
        $(this).addClass('hover');
    }, function(e){
        $(this).removeClass('hover');
    });
    window.onresize = onResize;
    onResize();
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
    var game = document.getElementById('gameID');
    if(game){
        var game_height = Math.max(window.innerHeight - busyHeight, 240);
        var game_width = Math.max(content.offsetWidth, 240);
        game.height = game_height;
        game.style.height = game_height;
        game.width = game_width;
        game.style.width = game_width;
    }
}