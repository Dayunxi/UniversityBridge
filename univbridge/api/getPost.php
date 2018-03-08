<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/13
 * Time: 22:05
 */
require_once ("bridgeDB.php");

$pid = $_POST['pid'];
if(!is_numeric($pid)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}
$db = new bridgeDB();
$ret = $db->getPosts(0, 0, $pid);
echo json_encode($ret[0]);   //fetch_all以数组形式返回