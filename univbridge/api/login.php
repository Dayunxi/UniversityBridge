<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/14
 * Time: 11:41
 */
include_once ("bridgeDB.php");

$account = $_POST['account'];
$password = $_POST['password'];
$expires = $_POST['expires'];
if(!is_numeric($expires)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}

$db = new bridgeDB();

$res = $db->login($account, $password, $expires);
//if($db->error == null){
//    foreach ($res as $key => $value){
//        if ($key == 'expires') continue;
//        setcookie($key, $value, $res['expires']);
//    }
//}
echo json_encode($res);