<?php
  header('Content-type: application/json');
  require_once('util.php');

  if (count($_GET) == 0) {
    $q = "select * from college";
    echo json_encode(db_query($q));
    die();
  }

  // if ($_GET['only_id_name'] == 1) {
  //   $q = "select id,name from college";
  //   echo json_encode(db_query($q));
  //   die();
  // }

  if ($_GET['id']) {
    $id = $_GET['id'];
    $p = array($id);

    $q = "select * from college where id = ?";
    $r = db_query($q, FALSE, $p);
    if (!$r) {
      echo "no college with id:{$id} found";
      die();
    }

    $college = $r;

    $q = "select value from degree
      where id in (select degree_id from college_degree where college_id = ?)";
    $r = db_query($q, TRUE, $p);
    foreach ($r as $e) {
      $college['degrees'][] = $e['value'];
    }

    $q = "select percentage, value from
      demographics_first_year join college_demographics_first_year
      on demographics_first_year.id =
      college_demographics_first_year.demographics_first_year_id
      where college_demographics_first_year.college_id = ?";
    $r = db_query($q, TRUE, $p);
    $college['demographics_first_year'] = $r;

    $q = "select name, degree_type
      from major join college_major on id = major_id
      where college_id = ?";
    $r = db_query($q, TRUE, $p);
    $college['majors'] = $r;

    $q = "select value
      from school_type where id in
      (select school_type_id from college_school_type where college_id = ?)";
    $r = db_query($q, TRUE, $p);
    foreach ($r as $e) {
      $college['school_types'][] = $e['value'];
    }

    $q = "select value
      from setting where id in
      (select setting_id from college_setting where college_id = ?)";
    $r = db_query($q, TRUE, $p);
    foreach ($r as $e) {
      $college['settings'][] = $e['value'];
    }

    echo json_encode($college);
    die();
  }

  if ($_GET['name']) {
    $q = "select * from college where name like ?";
    $p = array("%{$_GET['name']}%");
    echo json_encode(db_query($q, TRUE, $p));
    die();
  }

  if ($_GET['full_profile'] == 1) {
    $q = "select * from college_info";
    $colleges = db_query($q);

    for ($i = 0; $i < count($colleges); $i++) {
      $p = array($colleges[$i]['id']);

      $q = "select value from degree
      where id in (select degree_id from college_degree where college_id = ?)";
      $r = db_query($q, TRUE, $p);
      foreach ($r as $e) {
        $colleges[$i]['degrees'][] = $e['value'];
      }

      //$q = "select percentage, value from
      //demographics_first_year join college_demographics_first_year
      //on demographics_first_year.id =
      //college_demographics_first_year.demographics_first_year_id
      //where college_demographics_first_year.college_id = ?";
      //$r = db_query($q, TRUE, $p);
      //$colleges[$i]['demographics_first_year'] = $r;

      //$q = "select name, degree_type
      //from major join college_major on id = major_id
      //where college_id = ?";
      //$r = db_query($q, TRUE, $p);
      //$colleges[$i]['majors'] = $r;

      //$q = "select value
      //from school_type where id in
      //(select school_type_id from college_school_type where college_id = ?)";
      //$r = db_query($q, TRUE, $p);
      //foreach ($r as $e) {
        //$colleges[$i]['school_types'][] = $e['value'];
      //}

      //$q = "select value
      //from setting where id in
      //(select setting_id from college_setting where college_id = ?)";
      //$r = db_query($q, TRUE, $p);
      //foreach ($r as $e) {
        //$colleges[$i]['settings'][] = $e['value'];
      //}
    }

    echo json_encode($colleges);
    die();
  }

?>

