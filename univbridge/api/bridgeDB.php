<?php
/**
 * Created by PhpStorm.
 * User: Adam
 * Date: 2017/5/13
 * Time: 1:12
 */
include('CONSTANT.php');

class bridgeDB
{
    private $_host = 'localhost';
    private $_user = '------';
    private $_password = '------';
    private $_database = 'bridge';

    public $link;
    public $error;

    function __construct(){
        date_default_timezone_set('PRC');
        $error = null;
        $this->link = new mysqli($this->_host, $this->_user, $this->_password, $this->_database);
        if($this->link->connect_error) {
            die('[-]ERROR: Could not connect to MySQL: '.$this->link->connect_error);
        }
        $this->link->query("SET NAMES UTF8");               //required
    }

    function __destruct(){
        // TODO: Implement __destruct() method.
        mysqli_close($this->link);
    }

    private function checkFormat($str, $type){
        switch ($type){
            case "account":
                $accountType = null;
                if(preg_match("/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9])\d{8}$/", $str)) $accountType = "phone";
                else if(preg_match("/^[\w-]+@[\w-]+(\.[\w-]+)+$/", $str)) $accountType = "email";
                return $accountType;
            case "username":
                return preg_match("/^[\x{4E00}-\x{9FA5}\w]{2,10}$/u", $str);
            case "password":
                return preg_match("/[\dA-Fa-f]{32}/", $str);
            default:
                return false;
        }
    }
    private function detectXSS($str){
        return preg_match("/<.*?script.*?>/i", $str);
    }
    private function detectSQL($str){
        $re_match = "/(?:')|(?:--)|(\/\*)|(\b(select|update|and|or|union|delete|insert|trancate|char|into|substr|ascii|declare|exec|count|master|into|drop|execute)\b)/";
        return preg_match($re_match, $str);
    }
    private function setError($err_code, $message){
        $this->error = array('err_code' => $err_code, 'message' => $message);
        return $this->error;
    }

    private function setToken($uid, $expires){
        $token = md5(uniqid(rand(), true));
        $expires = $expires == -1? time() + 24*3600 : time() + $expires*3600;   //unit - hour
        $sql_token = "UPDATE `user` SET `token`='$token', `expires`='$expires' WHERE `uid`='$uid'";
        try{
            $res = $this->link->query($sql_token);
            if(!$res) throw new Exception("[-]ERROR: Set token error", SET_TOKEN_ERROR);
            $data = array("token" => $token, "expires" => $expires);
            return $data;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    public function login($account, $password, $expires){
        try{
            $accountType = $this->checkFormat($account, "account");
            if($accountType == null) throw new Exception("[-]ERROR: Account format error", AP_ERROR);
            if(!$this->checkFormat($password, "password")) throw new Exception("[-]ERROR: Password format error", AP_ERROR);
            $sql_query = "SELECT uid, username, avatar, status FROM `user` WHERE `account`='$account' AND `password`='$password'";
            $res = $this->link->query($sql_query);
            if($res->num_rows == 0)  throw new Exception("[-]ERROR: Account or password error", AP_ERROR);
            $data = $res->fetch_assoc();
            $token = $this->setToken($data["uid"], $expires);
            $data["token"] = $token["token"];
            $data["expires"] = $token["expires"];
            $this->error = null;
            return $data;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    public function register($account, $password, $username, $status){
        try{
            $accountType = $this->checkFormat($account, "account");
            if($accountType == null) throw new Exception("[-]ERROR: Account format error", REG_ERROR);
            if(!$this->checkFormat($username, "username")) throw new Exception("[-]ERROR: Username format error", REG_ERROR);
            if(!$this->checkFormat($password, "password")) throw new Exception("[-]ERROR: Password format error", REG_ERROR);

//            $sql_insert = "INSERT INTO `user` (`$accountType`, `password`, `username`) VALUES ('$account', '$password', '$username')";
            $sql_insert = "INSERT INTO `user` (`account`, `password`, `username`, `status`) VALUES ('$account', '$password', '$username', '$status')";
            $res = $this->link->query($sql_insert);     //插入返回BOOL值
            if(!$res) throw new Exception("[-]ERROR: Already has been registered", REG_ERROR);
            $uid = $this->link->insert_id;
            $data = array("uid" => $uid, "account" => $account, "username" => $username, "avatar" => '/images/default.jpg', "status" => $status);
            $token = $this->setToken($data["uid"], -1);
            $data["token"] = $token["token"];
            $data["expires"] = $token["expires"];
            $this->error = null;
            return $data;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    //每次向服务器请求资源时通过token验证是否登录
    public function checkLogin($uid, $token){
        try{
            $sql_select = "SELECT expires FROM `user` WHERE `uid`='$uid' AND `token`='$token'";
            $res = $this->link->query($sql_select);
            if($res->num_rows == 0)  throw new Exception("[-]ERROR: Token error", TOKEN_ERROR);
            $data = $res->fetch_assoc();
            if(time() > $data["expires"]) throw new Exception("[-]ERROR: Token expired", TOKEN_ERROR);
            $this->error = null;
            return true;
        }
        catch (Exception $ex){
            $this->setError($ex->getCode(), $ex->getMessage());
            return false;
        }
    }

    //检查是否有权限操作 同时检查是否登录
    public function checkStatus($uid, $token){
        try{
            $sql_select = "SELECT `status`, `expires` FROM `user` WHERE `uid`='$uid' AND `token`='$token'";
            $res = $this->link->query($sql_select);
            if($res->num_rows == 0)  throw new Exception("[-]ERROR: Token error", TOKEN_ERROR);
            $data = $res->fetch_assoc();
            if(time() > $data["expires"]) throw new Exception("[-]ERROR: Token expired", TOKEN_ERROR);
            $this->error = null;
            return $data["status"];
        }
        catch (Exception $ex){
            $this->setError($ex->getCode(), $ex->getMessage());
            return false;
        }
    }

    //获取用户信息
    public function getUserInfo($uid, $type='public'){
        try{
            if($type == 'private'){
                $sql_private = "SELECT `uid`, `account`, `username`, `status`, `avatar`, `date` FROM `user` WHERE `uid`='$uid'";
                $res = $this->link->query($sql_private);
                if(!$res) throw new Exception("[-]ERROR: Cannot getInfo");
                $info = $res->fetch_assoc();
                $this->error = null;
                return $info;
            }
            else{
                $sql_public = "SELECT `uid`, `username`, `status`, `avatar` FROM `user` WHERE `uid`='$uid'";
                $res = $this->link->query($sql_public);
                if(!$res) throw new Exception("[-]ERROR: Cannot getInfo");
                $info = $res->fetch_assoc();
                $this->error = null;
                return $info;
            }
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    //获取帖子
    //return key('author_id', 'avatar', 'comment_num', 'content', 'date', 'id', 'title', 'username')
    public function getPosts($offset, $count, $pid=null){
        try{
            $sql_posts = "SELECT * FROM `forum_posts` ORDER BY `last_comment_time` DESC LIMIT $offset, $count";
            if ($pid != null) $sql_posts = "SELECT * FROM `forum_posts` WHERE `id`=$pid";
            $res = $this->link->query($sql_posts);
            if($res->num_rows == 0)  throw new Exception("[-]ERROR: Empty response", RESPONSE_EMPTY);
            $posts = $res->fetch_all(MYSQLI_ASSOC);
            for($i = 0; $i < count($posts); $i++){
                $uid = $posts[$i]["author_id"];
                $sql_userInfo = "SELECT `avatar`, `username` FROM `user` WHERE `uid`='$uid'";
                $res = $this->link->query($sql_userInfo);
                $info = $res->fetch_assoc();
                $posts[$i]["avatar"] = $info["avatar"];
                $posts[$i]["username"] = $info["username"];
            }
            $this->error = null;
            return $posts;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    //获取评论
    //return key('author_id', 'avatar', 'comment_num', 'content', 'date', 'id', 'title', 'username')
    public function loadComments($pid, $offset, $count){
        try{
            $sql_comments = "SELECT * FROM `post_comments` WHERE `post_id`='$pid' ORDER BY `date` ASC LIMIT $offset, $count";
            $res = $this->link->query($sql_comments);
            if($res->num_rows == 0)  throw new Exception("[-]ERROR: Empty response", RESPONSE_EMPTY);
            $posts = $res->fetch_all(MYSQLI_ASSOC);
            for($i = 0; $i < count($posts); $i++){
                $uid = $posts[$i]["author_id"];
                $sql_userInfo = "SELECT `avatar`, `username` FROM `user` WHERE `uid`='$uid'";
                $res = $this->link->query($sql_userInfo);
                $info = $res->fetch_assoc();
                $posts[$i]["avatar"] = $info["avatar"];
                $posts[$i]["username"] = $info["username"];
            }
            $this->error = null;
            return $posts;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    //发表问答帖
    public function post($uid, $title, $content){
        try{
            if($this->detectXSS($title) || $this->detectXSS($content)) throw new Exception("[-]XSS: 大哥别搞我", DETECTED_XSS);
            $time = date('Y-m-d H:i:s');
            $sql_post = "INSERT INTO `forum_posts` (`title`, `author_id`, `content`, `last_comment_time`) VALUES('$title', '$uid', '$content', '$time')";
            $res = $this->link->query($sql_post);
            if(!$res)  throw new Exception("[-]ERROR: Cannot post");
            $this->error = null;
            return true;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    //评论
    public function comment($uid, $post_id, $content, $comment_id=null){
        try{
            if($this->detectXSS($content)) throw new Exception("[-]XSS: 大哥别搞我", DETECTED_XSS);
            if($this->detectSQL($content)) throw new Exception("[-]SQL: 大哥别搞我", DETECTED_SQL);
            $sql_comment = "INSERT INTO `post_comments` (`post_id`, `author_id`, `content`, `comment_id`) VALUES('$post_id', '$uid', '$content', '$comment_id')";
            $res = $this->link->query($sql_comment);
            if(!$res)  throw new Exception("[-]ERROR: Cannot reply");
            $time = date('Y-m-d H:i:s');
            $sql_update = "UPDATE `forum_posts` SET `comment_num`=`comment_num`+1, `last_comment_time`='$time'  WHERE `id`='$post_id'";  //评论数加1
            $this->link->query($sql_update);
            $this->error = null;
            return true;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }

    //获取大学
    public function loadUniversities($offset, $count, $order='ASC'){
        try{
            $sql_search = "SELECT * FROM `universities` ORDER BY `id` $order LIMIT $offset, $count"; //by rank 在40，41名的地方跳了一个。。。
            $res = $this->link->query($sql_search);
            if(!$res)  throw new Exception("[-]ERROR: No univ response", RESPONSE_EMPTY);
            $universities = $res->fetch_all(MYSQLI_ASSOC);
            $this->error = null;
            return $universities;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }
    //查找
    public function searchUnivs($keyword){
        try{
            if($this->detectXSS($keyword)) throw new Exception("[-]XSS: 大哥别搞我", DETECTED_XSS);
            if($this->detectSQL($keyword)) throw new Exception("[-]SQL: 大哥别搞我", DETECTED_SQL);
            $sql_search = "SELECT * FROM `universities` WHERE `name` LIKE '%$keyword%'";
            $res = $this->link->query($sql_search);
            if(!$res)  throw new Exception("[-]ERROR: No univ response", RESPONSE_EMPTY);
            $universities = $res->fetch_all(MYSQLI_ASSOC);
            if(count($universities) == 0) throw new Exception("[-]ERROR: No data match", NO_MATCH);
            $this->error = null;
            return $universities;
        }
        catch (Exception $ex){
            return $this->setError($ex->getCode(), $ex->getMessage());
        }
    }
}
