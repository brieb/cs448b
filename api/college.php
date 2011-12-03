<?php
  require_once('util.php');

  if (count($_GET) == 0) {
    $q = "select * from college";
    echo json_encode(db_query($q));
    die();
  }

  if ($_GET['id']) {
    $q = "select * from college where id = ?";
    $p = array($_GET['id']);
    echo json_encode(db_query($q, FALSE, $p));
    die();
  }

  if ($_GET['name']) {
    $q = "select * from college where name like ?";
    $p = array("%{$_GET['name']}%");
    echo json_encode(db_query($q, TRUE, $p));
    die();
  }

?>
