<?php
  require_once('util.php');

  $json_pretty_print = isset($_GET['jspp']) && $_GET['jspp'];

  if (count($_GET) == 0) {
    $q = "select * from college";
    echo print_json(db_query($q), $json_pretty_print);
    die();
  }

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
    $college['degrees'] = $r;

    $q = "select percentage, value from
      college_demographics_first_year join college
      on college.id = college_demographics_first_year.college_id
      join demographics_first_year
      on demographics_first_year.id = college_demographics_first_year.demographics_first_year_id
      where college.id = ?";
    $r = db_query($q, TRUE, $p);
    $college['demographics_first_year'] = $r;

    $q = "select degree_type, category, name
      from major where id in
      (select major_id from college_major where college_id = ?)";
    $r = db_query($q, TRUE, $p);
    $college['majors'] = $r;

    $q = "select value
      from school_type where id in
      (select school_type_id from college_school_type where college_id = ?)";
    $r = db_query($q, TRUE, $p);
    $college['school_types'] = $r;

    $q = "select value
      from setting where id in
      (select setting_id from college_setting where college_id = ?)";
    $r = db_query($q, TRUE, $p);
    $college['settings'] = $r;

    echo print_json($college, $json_pretty_print);
    die();
  }

  if ($_GET['name']) {
    $q = "select * from college where name like ?";
    $p = array("%{$_GET['name']}%");
    echo print_json(db_query($q, TRUE, $p), $json_pretty_print);
    die();
  }

?>

join college_school_type on college.id = college_school_type.college_id
join college_setting on college.id = college_setting.college_id
