<?php
  header('Content-type: application/json');
  require_once('util.php');

  if (count($_GET) == 0) {
    $q = "select id, name from major";
    echo json_encode(db_query($q));
    die();
  }

  if ($_GET['q']) {
    $q = "select id, name from major where name like ?";
    echo json_encode(db_query($q, TRUE, array('%'.$_GET['q'].'%')));
    die();
  }

