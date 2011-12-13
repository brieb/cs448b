<?php
  header('Content-type: application/json');
  require_once('util.php');

  if (count($_GET) == 0) {
    die();
  }

  if ($_GET['major_ids']) {
    $major_ids = $_GET['major_ids'];
    $num_major_ids = count($major_ids);
    $q = "select college_id, count(1) as num_majors, ".
      $num_major_ids." as num_majors_specified ".
      "from college_major where major_id in (";
    for ($i = 0; $i < count($major_ids); $i++) {
      $q .= "?";
      if ($i != count($major_ids)-1) {
        $q .= ",";
      }
    }
    $q .= ") group by college_id";
    echo json_encode(db_query($q, TRUE, $major_ids));
    die();
  }

