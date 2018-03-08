<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/15
 * Time: 17:26
 */
require_once ("../bridgeDB.php");
$status = include_once("../checkStatus.php");

$uid = $_POST['uid'];
if(!is_numeric($uid)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}
$db = new bridgeDB();
if($_COOKIE['uid'] == $uid) $ret = $db->getUserInfo($uid, 'private');
else $ret = $db->getUserInfo($uid, 'public');
echo json_encode($ret);