<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/3/28
 * Time: 22:35
 */
include_once ("bridgeDB.php");

$account = $_POST['account'];
$password = $_POST['password'];
$username = $_POST['username'];
$status = $_POST['status'];

$db = new bridgeDB();

$res = $db->register($account, $password, $username, $status);

echo json_encode($res);