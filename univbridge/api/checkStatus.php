<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/4/3
 * Time: 15:34
 */
include_once("bridgeDB.php");

$uid = $_COOKIE["uid"];
$token = $_COOKIE["token"];
$db = new bridgeDB();
$status = $db->checkStatus($uid, $token);
if($status === false) exit(json_encode($db->error));
return $status;
//if($db->checkLogin($uid, $token) !== true) exit(json_encode($db->error));   //return cannot