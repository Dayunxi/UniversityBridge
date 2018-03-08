<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/14
 * Time: 0:37
 */
require_once ("bridgeDB.php");
$status = include_once("checkStatus.php");

$uid = $_POST['uid'];
$post_id = $_POST['post_id'];
$comment_id = $_POST['comment_id'];
$content = $_POST['content'];
if(!is_numeric($uid) ||!is_numeric($post_id) || !is_numeric($comment_id)){
    echo json_encode(array('err_code' => ABNORMAL_POST,'message' => '大哥别'));
    exit();
}

$db = new bridgeDB();
$ret = $db->comment($uid, $post_id, $content, $comment_id);
echo json_encode($ret);