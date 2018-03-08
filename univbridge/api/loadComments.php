<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/13
 * Time: 22:05
 */
require_once ("bridgeDB.php");

$pid = $_POST['pid'];
$offset = $_POST['offset'];
$count = $_POST['count'];
if(!is_numeric($pid) ||!is_numeric($offset) || !is_numeric($count)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}
$db = new bridgeDB();
$ret = $db->loadComments($pid, $offset, $count);
echo json_encode($ret);