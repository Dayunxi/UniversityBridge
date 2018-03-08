/**
 * Created by Adam on 2017/5/13.
 */
$(function () {
    'use strict';

    // //新载入页面预加载20个
    // $(document).on("pageInit", "#home", function(e, id, page) {
    //     if($('div.card.facebook-card').length != 0) return;
    //     loadPosts(0, 20, function(){});
    // });

    //login
    $(document).on('pageInit', function(){
        cookieLogin();
    });
    //内容和评论
    $(document).on('pageInit', '#post', function(e, id, page){
        if($('.post-comment .card.facebook-card').length != 0) return;
        var pid = getQueryString('pid');
        getPost(pid, function(post){
            $('#detail-post-title').text(post['title']);
            $('#detail-post-author').text(post['username']);
            $('#detail-post-content').text(post['content']);
            $('#detail-post-avatar').prop('src', post['avatar']);
            $('#detail-post-user').prop('href', '/user/?uid='+post['author_id']);
            $('#detail-post-time').text(displayTime(post['date']));
            $('#detail-post-comment').attr('data-id', post['id']);
        });
        // loadComments(pid, 0, 20, function(){})
    });
    //个人页面
    $(document).on("pageInit", "#personal", function(e, id, page) {
        var uid = getQueryString('uid');
        if(!uid) uid = getCookie('uid');
        getUserInfo(uid, function(info){
            if(info['uid'] == getCookie('uid')){  //是自己的信息
                page.find('.personal-visible').removeAttr('style');
            }
            else{
                page.find('.personal-visible').attr('style', 'display: none');
            }
            var group = '';
            switch(parseInt(info['status'])){
                case 1:
                    group = '高中生';
                    break;
                case 2:
                    group = '本科生';
                    break;
                case 666:
                    group = '管理员';
                    break;
            }
            page.find('#personal-avatar').attr('src', info['avatar']);
            page.find('#personal-name').text(info['username']);
            page.find('#personal-status').text(group);
        });
    });

    //点击头像后阻止冒泡
    $(document).on('click', '.facebook-avatar a', function(event){      //怕不是zepto的事件冒泡有毒
        event.stopPropagation();
    });
    //打开popup post
    $(document).on('click','.open-post', function() {
        $.popup('.popup-post');
    });
    //打开popup login
    $(document).on('click','.open-login', function() {
        $.popup('.popup-login');
    });
    //打开popup register
    $(document).on('click','.open-register', function() {
        $.popup('.popup-register');
    });
    //打开popup 评论框
    $(document).on('click','.comment', function(e) {
        if(checkCookie()){
            $.popup('.popup-comment');
            var dataSet = e.currentTarget.dataset;
            $(document).off('click', '#confirm-comment');
            $(document).on('click', '#confirm-comment', function(){
                if(dataSet['post_id'] == undefined) comment(dataSet['id'], null);   //回复帖子
                else comment(dataSet['post_id'], dataSet['id']);                    //回复评论
            });
        }
        else $.alert('登陆后评论');
    });
    //进入帖子
    // $(document).on("click", ".post-list .card.facebook-card", function(e, id, page) {
    //     $.router.load("/posts/?pid="+e.currentTarget.id.split('-')[1]);  //就是有这种操作.jpg
    // });
    //进入帖子
    $(window).on("click", ".post-list .card.facebook-card", function(e, id, page) {  //孩他妈有这种操作？？？？？？？？？
        $.router.load("/posts/?pid="+e.currentTarget.id.split('-')[1]);  //就是有这种操作.jpg
    });
    //刷新
    $(document).on('click', '#posts-refresh', function(){
        $.showIndicator();
        loadPosts(0, 20, function(){
            console.log('refresh');
            $('.home div.card.facebook-card').remove();
            $.hideIndicator();
        });
    });

    //搜索
    $(document).on('keydown', '#search-univ', function(e, id, page){  //此事件无id与page
        var keyword = $('#search-univ').val();
        if(keyword == ''){
            $('.search li.univ-body').remove();
            loadUnivs(0, 20);
            return;
        }
        if(e.keyCode == 13){
            $.router.load('/#search');
            searchUnivs(keyword);
            $.closePanel();
        }
    });

    // 添加'refresh'监听器
    // 下拉刷新评论
    $(document).on('refresh', '.pull-to-refresh-content.refresh-comment',function(e) {
        var pid = getQueryString('pid');
        loadComments(pid, 0, 20, function(){
            $.pullToRefreshDone('.pull-to-refresh-content');
            $('.post .post-comment .card').remove();
            $.toast('刷新完成');
        });
    });
    // 下拉刷新问答
    $(document).on('refresh', '.pull-to-refresh-content.refresh-post',function(e) {
        loadPosts(0, 20, function(){
            $.pullToRefreshDone('.pull-to-refresh-content');
            $('.home div.card.facebook-card').remove();
            $.toast('刷新完成');
        });
    });
    // $.initPullToRefresh('.pull-to-refresh-content');

    //无限滚动-home
    $(document).on("pageInit", "#home", function(e, id, page) {
        var loading = false;
        // 每次加载添加多少条目
        var itemsPerLoad = 20;
        // 最多可加载的条目
        var maxItems = 310;
        var lastIndex = page.find('.card.facebook-card').length;
        if(lastIndex == 0){
            loadPosts(0, 10, function(data){
                if(parseInt(data['err_code']) == 7 || data.length < 10){
                    removeInfinite();
                }
            });
        }
        $(page).off('infinite');  //否则在页面切换时会重复绑定
        $(page).on('infinite', function() {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            lastIndex = page.find('.card.facebook-card').length;  //page是实时刷新的
            if (lastIndex >= maxItems) {
                removeInfinite();
                return;
            }
            loadPosts(lastIndex, itemsPerLoad, function(data){
                if(parseInt(data['err_code']) == 7 || data.length < itemsPerLoad){
                    removeInfinite();
                    return;
                }
                loading = false;
                $.refreshScroller();
            });
        });
        function removeInfinite(){
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll(page.find('.infinite-scroll'));
            // 删除加载提示符
            page.find('.infinite-scroll-preloader').remove();
            $.toast('问答贴已加载完毕');
            loading = false;
        }
    });
    //无限滚动-post
    $(document).on("pageInit", "#post", function(e, id, page) {
        var loading = false;
        // 每次加载添加多少条目
        var itemsPerLoad = 20;
        // 最多可加载的条目
        var maxItems = 310;
        var lastIndex = page.find('.post-comment .card').length;
        var pid = getQueryString('pid');
        if(lastIndex == 0){
            loadComments(pid, 0, 20, function(data){
                if(parseInt(data['err_code']) == 7 || data.length < 20){
                    removeInfinite();
                }
            });
        }
        $(page).off('infinite');  //否则在页面切换时会重复绑定
        $(page).on('infinite', function() {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            lastIndex = page.find('.post-comment .card').length;  //page是实时刷新的
            if (lastIndex >= maxItems) {
                removeInfinite();
                return;
            }
            loadComments(pid, lastIndex, itemsPerLoad, function(data){
                if(parseInt(data['err_code']) == 7 || data.length < itemsPerLoad){
                    removeInfinite();
                    return;
                }
                loading = false;
                $.refreshScroller();
            });
        });
        function removeInfinite(){
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll(page.find('.infinite-scroll'));
            // 删除加载提示符
            page.find('.infinite-scroll-preloader').remove();
            $.toast('评论已加载完毕');
            loading = false;
        }
    });
    //无限滚动-univ
    $(document).on("pageInit", "#universities", function(e, id, page) {
        var loading = false;
        // 每次加载添加多少条目
        var itemsPerLoad = 50;
        // 最多可加载的条目
        var maxItems = 310;
        var lastIndex = page.find('.list-container li').length - 1; //表头
        if(lastIndex == 0){
            loadUnivs(0, 20, function(data){
                if(parseInt(data['err_code']) == 7 || data.length < 20){
                    removeInfinite();
                }
            });
        }
        $(page).off('infinite');  //否则在页面切换时会重复绑定
        $(page).on('infinite', function() {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            lastIndex = page.find('.list-container li').length - 1; //表头
            if (lastIndex >= maxItems) {
                removeInfinite();
                return;
            }
            loadUnivs(lastIndex, itemsPerLoad, function(data){
                if(parseInt(data['err_code']) == 7 || data.length < itemsPerLoad){
                    removeInfinite();
                    return;
                }
                loading = false;
                $.refreshScroller();
            });
        });
        function removeInfinite(){
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll(page.find('.infinite-scroll'));
            // 删除加载提示符
            page.find('.infinite-scroll-preloader').remove();
            $.toast('学校已加载完毕');
            loading = false;
        }
    });



    //加载提示符
    $(document).on("pageInit", "#page-preloader", function(e, id, page) {
        $(page).on('click','.open-preloader-title', function () {
            $.showPreloader('加载中...');
            setTimeout(function () {
                $.hidePreloader();
            }, 2000);
        });
        $(page).on('click','.open-indicator', function () {
            $.showIndicator();
            setTimeout(function () {
                $.hideIndicator();
            }, 2000);
        });
    });


    $.init();
    // console.log($.device);
});



function getPost(pid, callback){
    $.ajax({
        url: '/api/getPost.php',
        type: 'POST',
        data: {
            pid: pid
        },
        success: function(data){
            var post = JSON.parse(data);
            if(callback) callback(post);
        }
    })
}

function loadPosts(offset, count, callback){
    $.ajax({
        url: '/api/loadPosts.php',
        type: 'POST',
        data: {
            offset: offset,
            count: count,
            order: 'DESC'
        },
        success: function(data){
            data = JSON.parse(data);
            if(callback) callback(data); // 放前面可以不那么早地就remove
            for(var i = 0; i < data.length; i++){
                appendCard(data[i]);
            }
        }
    })
}

function loadComments(pid, offset, count, callback){
    $.ajax({
        url: '/api/loadComments.php',
        type: 'POST',
        data: {
            pid: pid,
            offset: offset,
            count: count
        },
        success: function(data){
            data = JSON.parse(data);
            if(callback) callback(data); // 放前面可以不那么早地就remove
            for(var i = 0; i < data.length; i++){
                appendComment(data[i]);
            }
        }
    })
}

function loadUnivs(offset, count, callback){
    $.ajax({
        url: '/api/loadUniversities.php',
        type: 'POST',
        data: {
            offset: offset,
            count: count,
            order: 'ASC'
        },
        success: function(data){
            data = JSON.parse(data);
            if(callback) callback(data);
            for(var i = 0; i < data.length; i++){
                appendUniv(data[i]);
            }
        }
    });
}

function appendCard(cardInfo){
    var demo = '<div class="card facebook-card" id="post-' + cardInfo["id"] + '">'+
        // '<a id="href-post-' + cardInfo["id"] + '" href="/posts/?pid=' + cardInfo["id"] + '"></a>'+
        '<div valign="bottom" class="card-header color-white no-border">'+
        '<div class="facebook-avatar">'+
        '<a href="/user/?uid=' + cardInfo["author_id"] + '" class="card-avatar-a"><img src="' + cardInfo["avatar"] + '" class="card-avatar"></a>'+
        '</div>'+
        '<div class="facebook-name">' + cardInfo["username"] + '</div>'+
        '<span class="card-title">' + cardInfo["title"] + '</span>'+
        '</div>'+
        '<div class="card-content">'+
        '<div class="card-content-inner">'+
        '<p class="card-digest">' + cardInfo["content"].substring(0, 100) + '</p>'+
        '</div>'+
        '</div>'+
        '<div class="card-footer">'+
        '<a href="#" class="link card-post_time">' + displayTime(cardInfo["last_comment_time"]) + '</a>'+
        '<a href="#" class="link card-comment">回复&nbsp;' + cardInfo["comment_num"] + '</a>'+
        '</div>'+
        '</div>';
    $("div.post-list").append(demo);
}

function appendComment(commentInfo){
    var demo = '<div class="card facebook-card">'+
        '<div valign="bottom" class="card-header color-white no-border">'+
        '<div class="facebook-avatar">'+
        '<a href="/user/?uid=' + commentInfo["author_id"] + '" class="comment-avatar-a"><img src="' + commentInfo["avatar"] + '" class="comment-avatar"></a>'+
        '</div>'+
        '<div class="facebook-name">' + commentInfo["username"] +
        '<a data-id="' + commentInfo["id"] + '" data-comment_id="' + commentInfo["comment_id"] + '" data-post_id="' + commentInfo["post_id"] + '" class="link pull-right comment">回复</a>'+
        '</div>'+
        '<span class="comment-time">' + displayTime(commentInfo["date"]) + '</span>'+
        '</div>'+
        '<div class="card-content">'+
        '<div class="card-content-inner">'+
        '<p class="comment-content">' + commentInfo["content"] + '</p>'+
        '</div>'+
        '</div>'+
        // '<div class="card-footer">'+
        // '<a href="#" class="link card-comment_time">' + displayTime(commentInfo["date"]) + '</a>'+
        // '</div>'+
        '</div>';
    $("div.post-comment").append(demo);
}

function appendUniv(univInfo, position){
    // 生成新条目的HTML
    var demo = '<li class="item-content univ-body"><div class="item-inner row">'+
        '<div class="col-50">' + univInfo['name'] + '</div><div class="col-15">' + univInfo['scale'] + '</div>'+
        '<div class="col-15">' + univInfo['rank'] + '</div>'+
        '<div class="col-15"><a href="http://' + univInfo['url'] + '" class="external"><span class="icon icon-search"></span></a></div>'+
        '</div></li>';
    // 添加新条目
    if(position == '.search') $('.search .list-container').append(demo);
    else $('.universities .infinite-scroll .list-container').append(demo);
}

function searchUnivs(keyword, callback){
    $.ajax({
        url: '/api/searchUnivs/',
        type: 'POST',
        data: {
            keyword: keyword
        },
        success: function(data){
            data = JSON.parse(data);
            $('.search li.univ-body').remove();
            if(data['err_code'] == 8){
                $.alert('没有匹配数据');
                return false;
            }
            else if(data['err_code'] != undefined){
                $.alert(data['message']);
                return false;
            }
            for(var i = 0; i < data.length; i++){
                appendUniv(data[i], '.search');
            }
            if(callback) callback();
        }
    });
}

function getQueryString(key){
    var string = window.location.search.substring(1);
    var vars = string.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == key) return pair[1];
    }
    return false;
}

function displayTime(time){
    var lastTime = new Date(time);
    var nowTime = new Date();
    if($.device['ios']) {
        var arr = time.split(/[- :]/);
        lastTime = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
    }
    var interval = Math.round((nowTime.getTime()-lastTime.getTime())/1000);
    var display = '';
    if(interval < 60) display = (interval).toString() + '秒前';
    else if(interval < 60*60) display = Math.floor(interval/60).toString() + '分钟前';
    else if(interval < 60*60*24) display = Math.floor(interval/60/60).toString() + '小时前';
    else if(interval < 60*60*24*30) display = lastTime.getFullYear() == nowTime.getFullYear()? lastTime.Format('MM-dd hh:mm') : lastTime.Format('yyyy-MM-dd');
    else if(interval < 60*60*24*30*12) display = lastTime.getFullYear() == nowTime.getFullYear()? lastTime.Format('MM-dd hh:mm') : lastTime.Format('yyyy-MM-dd');
    else display = lastTime.Format('yyyy-MM-dd');
    return display;
}

// 下面三个需要权限
function post(callback){
    if(!checkCookie()){
        $.alert('请登录');
        $.router.load('/');
        return false;
    }
    $.confirm('确认?', function(){
        $.ajax({
            url: '/api/post.php',
            type: 'POST',
            data: {
                uid: getCookie('uid'),
                title: $('#post-title').val(),
                content: $('#post-content').val()
            },
            success: function(data){
                data = JSON.parse(data);
                if(data['err_code'] != undefined){
                    if(parseInt(data['err_code']) == 2){
                        $.alert('请重新登录', function(){
                            logout();
                        });
                    }
                    else $.alert(data['message']);
                    return false;
                }
                $.toast('发表成功');
                $.closeModal('.popup-post');
                $.showIndicator();
                $('div.card.facebook-card').remove();
                loadPosts(0, 20, function(){
                    $.hideIndicator();
                });
                if(callback) callback(data);
            }
        })
    });
}
function comment(post_id, comment_id, callback){
    if(!checkCookie()){
        $.alert('请登录');
        $.router.load('/');
        return false;
    }
    $.confirm('确认?', function(){
        $.ajax({
            url: '/api/comment.php',
            type: 'POST',
            data: {
                uid: getCookie('uid'),
                post_id: post_id,
                comment_id: comment_id,
                content: $('#comment-content').val()
            },
            success: function(data){
                data = JSON.parse(data);
                if(data['err_code'] != undefined){
                    if(parseInt(data['err_code']) == 2){
                        $.alert('请重新登录', function(){
                            logout();
                        });
                    }
                    else $.alert(data['message']);
                    return false;
                }
                $.toast('发表成功');
                $.closeModal('.popup-comment');
                // $.pullToRefreshTrigger('.pull-to-refresh-content.refresh-comment');  //可以 但这样会有个toast
                var pid = getQueryString('pid');
                loadComments(pid, 0, 20, function(){
                    $('.post-comment .card').remove();
                });
                if(callback) callback(data);
            }
        })
    });
}

function getUserInfo(uid, callback){
    if(!checkCookie()){
        $.alert('请登录');
        $.router.load('/');
        return false;
    }
    $.ajax({
        url: '/api/getUserInfo/',
        type: 'POST',
        data: {
            uid: uid
        },
        success: function(data){
            data = JSON.parse(data);
            if(data['err_code'] != undefined){
                if(parseInt(data['err_code']) == 2){
                    $.alert('请重新登录', function(){
                        logout();
                    });
                }
                else $.alert(data['message']);
                return false;
            }
            if(callback) callback(data);
        }
    })
}

function login(){
    var salt = "_adamyt_";
    var account = $('#account-login').val();
    var password = $('#pass-login').val();
    password = md5(md5(password + salt) + salt);
    var  expires = $("#rememberMe").prop("checked")? 7*24 : -1;
    if(!account || !password) {
        $.alert('账号密码不能为空');
        return false;
    }
    $.ajax({
        url: "/api/login.php",
        type: "POST",
        data: {
            account: account,
            password: password,
            expires: expires
        },
        success: function(data){
            data = JSON.parse(data);
            if(data["err_code"] != undefined){
                // $.alert(data["message"]);
                $.alert('账号或密码错误');
                return;
            }
            $.closeModal();
            for(var key in data){
                if(key == 'expires') continue;
                if(data.hasOwnProperty(key)) setCookie(key, data[key], expires);  //可能有包含原型信息
            }
            $.toast('登录成功');
            // switch(data["status"]){
            //     case "1":
            //         setCookie("u_group", "用户", expires);
            //         break;
            //     case "0":
            //         setCookie("u_group", "小黑屋", expires);
            //         break;
            //     case "666":
            //         setCookie("u_group", "管理员", expires);
            //         break;
            // }
            afterLogin();
        },
        error: function(){
            $.alert("登录失败");
        }
    })
}

function register(){
    var salt = "_adamyt_";
    var account = $('#account-register').val();
    var username = $('#username-register').val();
    var password = $('#pass-register').val();
    var password2 = $('#pass2-register').val();
    var status = $('#status-register').val();
    if(!checkFormat(account, "account")){
        $.alert("账号格式不正确");
        return false;
    }
    if(!checkFormat(username, "username")){
        $.alert("用户名格式不正确");
        return false;
    }
    if(!checkFormat(password, "password")){
        $.alert("密码格式不正确");
        return false;
    }
    if (password != password2) {
        $.alert("两次密码不同");
        return false;
    }
    password = md5(md5(password + salt) + salt);
    $.ajax({
        url: "/api/register.php",
        type: "POST",
        data: {
            account: account,
            username: username,
            password: password,
            status: status
        },
        success: function(data){
            data = JSON.parse(data);
            if(data["err_code"] != undefined){
                $.alert(data["message"]);
                return;
            }
            $.closeModal();
            for(var key in data){
                if(key == 'expires') continue;
                if(data.hasOwnProperty(key)) setCookie(key, data[key]);  //可能有包含原型信息
            }
            $.toast('注册成功');
            afterLogin();
        },
        error: function(){
            $.alert("注册失败");
        }
    })
}

function checkFormat(string, type){
    switch(type){
        case "account":
            var re_email = /^[\w-]+@[\w-]+(\.[\w-]+)+$/;
            var re_phone = /^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9])\d{8}$/;
            return re_email.test(string) || re_phone.test(string);
        case "password":
            var re_pwd = /^[\w@#&*?,.]{6,15}$/;
            return re_pwd.test(string);
        case "username":
            var re_name = /^[\u4e00-\u9fa5\w]{2,10}$/;
            return re_name.test(string);
        default:
            return false;
    }
}

function checkCookie()
{
    var user = getCookie("uid");
    var token = getCookie("token");
    var avatar = getCookie("avatar");
    var status = getCookie("status");
    return user && token && avatar && status;
}

function cookieLogin(){    //cookie登录 body_load
    var user = getCookie("uid");
    var token = getCookie("token");
    var avatar = getCookie("avatar");
    if(user && token && avatar){
        console.log("已登录");
        afterLogin();
    }
    else console.log("未登录");
}

function afterLogin(){
    $('.current-user-avatar').attr('src', getCookie('avatar'));
    $('.current-user-name').text(getCookie('username'));
    $('.login-visible').removeAttr('style');
    $('.login-hidden').attr('style', 'display: none');
}

function logout(){
    clearCookie("uid");
    clearCookie("username");
    clearCookie("token");
    clearCookie("avatar");
    clearCookie("status");
    $('.login-visible').attr('style', 'display: none');
    $('.login-hidden').removeAttr('style');
    // $.router.load('/');
    location.href = '/';
}

// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
