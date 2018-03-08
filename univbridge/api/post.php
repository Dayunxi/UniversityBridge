<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/14
 * Time: 0:20
 */
require_once ("bridgeDB.php");
$status = include_once("checkStatus.php");

$uid = $_POST['uid'];
$title = $_POST['title'];
$content = $_POST['content'];
if(!is_numeric($uid)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}
$db = new bridgeDB();
$ret = $db->post($uid, $title, $content);
echo json_encode($ret);