<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/13
 * Time: 1:18
 */
//ERROR CODE
define("AP_ERROR", 0);                  //账户密码错误
define("REG_ERROR", 1);                 //账户已存在
define("TOKEN_ERROR", 2);               //token错误
define("SET_TOKEN_ERROR", 3);           //设置token出错
define("DANGER_FILE", 4);               //危险扩展名
define("DIR_MISS", 5);                  //目录不存在
define("PERMISSION_DENIED", 6);         //权限不足

define("RESPONSE_EMPTY", 7);            //返回为空
define("NO_MATCH", 8);                  //没有匹配数据
define("DETECTED_XSS", 9);              //检测到xss注入
define("DETECTED_SQL", 10);              //检测到sql注入
define("ABNORMAL_POST", 11);              //非正常请求数据