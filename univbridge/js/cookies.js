/**
 * Created by Adam on 2017/3/31.
 */
function setCookie(key, value, exhours)
{
    exhours = arguments.length == 3? exhours : -1;
    var time = new Date();
    time.setTime(time.getTime() + (exhours*60*60*1000));
    var expires = "expires=" + time.toUTCString();
    if(exhours == -1 || exhours == 0) expires = "expires=" + exhours;
    document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

function getCookie(key){
    var name = key + "=";
    var cookies = document.cookie.split(";");
    for(var i = 0; i < cookies.length; i++){
        var cookie = cookies[i].trim();
        if(cookie.indexOf(name) == 0) return cookie.substring(name.length, cookie.length);
    }
    return "";
}

function clearCookie(key){
    var time = new Date();
    time.setTime(time.getTime() - 1000);   //当前时间前一秒
    var expires = "expires=" + time.toUTCString();
    document.cookie = key + "=;" + expires + ";path=/";
}

