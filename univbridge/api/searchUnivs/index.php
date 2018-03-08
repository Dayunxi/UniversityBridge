<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/15
 * Time: 0:28
 */
require_once ("../bridgeDB.php");

$keyword = $_POST['keyword'];

$db = new bridgeDB();
$ret = $db->searchUnivs($keyword);
echo json_encode($ret);