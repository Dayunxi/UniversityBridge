/**
 * Created by Adam on 2017/5/13.
 */
$(function(){
    $.init();
//        $.config = {
//            swipePanel: "right",
//            swipePanelOnlyClose: false
//        };
    $(document).on('click','.open-post', function () {
        $.popup('.popup-post');
    });

    $.ajax({
        url: '/api/loadPosts.php',
        type: 'POST',
        data: {},
        success: function(data){
            var posts = JSON.parse(data);
            for(var i = 0; i < posts.length; i++){
                console.info(posts[i]);
                generateCard(posts[i]);
            }
            (function(){
                $('.facebook-avatar').on('click', function(event){
//            event.preventDefault();
                    event.stopPropagation();
                }, false);
            })();
        }
    })
});
// $(function(){
//     $(document).on('pageInit','#home', function (e, id, page) {
//         $(document).on('click','.open-post', function () {
//             $.popup('.popup-post');
//         });
//         $.ajax({
//             url: '/api/loadPosts.php',
//             type: 'POST',
//             data: {
//
//             },
//             success: function(data){
//                 var posts = JSON.parse(data);
//                 for(var i = 0; i < posts.length; i++){
//                     console.info(posts[i]);
//                     generateCard(posts[i]);
//                 }
//                 (function(){
//                     $('.facebook-avatar').on('click', function(event){
// //            event.preventDefault();
//                         event.stopPropagation();
//                     }, false);
//                 })();
//             }
//         })
//     });
//     $.init();
// });


function turn2post(pid){
    // window.location.href = '/posts/?pid=' + pid;
    console.log('click');
    $('#href-post-'+pid.toString()).trigger('click');
}

function generateCard(cardInfo){
    var demo = '<div class="card facebook-card" onclick="turn2post(' + cardInfo["id"] + ')">'+
        '<a id="href-post-' + cardInfo["id"] + '" href="/posts/?pid=' + cardInfo["id"] + '"></a>'+
        '<div valign="bottom" class="card-header color-white no-border">'+
        '<div class="facebook-avatar">'+
        '<a href="#' + cardInfo["author_id"] + '" class="card-avatar-a"><img src="' + cardInfo["avatar"] + '" class="card-avatar"></a>'+
        '</div>'+
        '<div class="facebook-name">' + cardInfo["username"] + '</div>'+
        '<span class="card-title">' + cardInfo["title"] + '</span>'+
        '</div>'+
        '<div class="card-content">'+
        '<div class="card-content-inner">'+
        '<p class="card-digest">' + cardInfo["content"] + '</p>'+
        '</div>'+
        '</div>'+
        '<div class="card-footer">'+
        '<a href="/posts/?pid=1" class="link card-post_time">' + displayTime(cardInfo["last_comment_time"]) + '</a>'+
        '<a href="#" class="link card-comment">回复&nbsp;' + cardInfo["comment_num"] + '</a>'+
        '</div>'+
        '</div>';
    $("div.page-index").append(demo);
    // console.info(demo);
}

function displayTime(time){
    var lastTime = new Date(time).getTime();
    var nowTime = new Date().getTime();
    var interval = Math.round((nowTime-lastTime)/1000);
    var display = '';
    if(interval < 60) display = (interval).toString() + '秒前';
    else if(interval < 60*60) display = Math.floor(interval/60).toString() + '分钟前';
    else if(interval < 60*60*24) display = Math.floor(interval/60/60).toString() + '小时前';
    else if(interval < 60*60*24*30) display = Math.floor(interval/60/60/24).toString() + '天前';
    else if(interval < 60*60*24*30*12) display = Math.floor(interval/60/60/24/30).toString() + '个月前';
    else display = Math.floor(interval/60/60/24/30/12).toString() + '年前';
    return display;
}

