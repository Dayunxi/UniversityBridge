<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/14
 * Time: 21:37
 */
require_once ("bridgeDB.php");

$offset = $_POST['offset'];
$count = $_POST['count'];
if(!is_numeric($offset) || !is_numeric($count)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}
$db = new bridgeDB();
$ret = $db->loadUniversities($offset, $count);
echo json_encode($ret);
