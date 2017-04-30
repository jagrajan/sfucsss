$(document).ready(function(){
    $('.right.menu.open').on("click",function(e){
        e.preventDefault();
        $('.ui.vertical.menu').toggle();
    });
    $('.navbar.vertical').hide();
    $('.ui.dropdown').dropdown();
});