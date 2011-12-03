<?php
  $name = $_GET['name'];
  if (!$name) {
    echo "please specify a name parameter";
  } else {
    require_once('util.php');
    $q = "select * from college where name like ?";
    $p = array("%{$name}%");
    echo json_encode(db_query($q, TRUE, $p));
  }
?>
